const socket = require('./index.js');
const { VERIFY_MACHINE, MACHINE_CONNECTED, MACHINE_REQUEST } = require('./Events');

const MACHINENUMBER = process.env.MACHINENUMBER;
const { releaseMachine, blocksMachine, flowCountPerLiter } = require('./board');

const { getState, getConsume } = require('./machineState');

var machine = {};
var timerId = null;

connect = () => {
    // console.log("Connected");
    socket.emit(VERIFY_MACHINE);
    socket.on(VERIFY_MACHINE, (result) => {
        // console.log("aqui entao")
        setMachine(result);
    });
};

setMachine = (result) => {
    // console.log("aqui");
    console.log(result);
    if (result.machine !== null) {
        socket.emit(MACHINE_CONNECTED, { ...result.machine, v: process.env.VERSION });
        machine = result.machine;
        socket.off(VERIFY_MACHINE);
        openMachine();
    }
};

openMachine = () => {
    // console.log(`${MACHINE_REQUEST}-${MACHINENUMBER}`);
    //console.log(machine);
    console.log('maquina disponivel');
    socket.on(`${MACHINE_REQUEST}-${MACHINENUMBER}`, (user) => {
        //valida se a maquina esta disponivel

        const state = getState();
        if (!state.active) {
            console.log('maquina solicitada por: ', user);
            // test();
            startCount();
            releaseMachine();
            console.log('MACHINE_CONSUMPTION started');
            var autoBlock = setTimeout(() => finishOperation(user), 7000);

            timerId = setInterval(function () {
                const state = getState();
                socket.emit('MACHINE_CONSUMPTION', {
                    userId: user.userId,
                    consume: getConsume(),
                });
                if (autoBlock !== null && state.flowCount >= 5) {
                    clearTimeout(autoBlock);
                    autoBlock = null;
                }

                //console.log(state.startCount);
                if (state.stopCount > 100) finishOperation(user);
                // interaction++;
                // if (interaction > 20) finishOperation(user, timerId);
                if (getConsume() > user.credit) {
                    finishOperation(user);
                }
            }, 100);
        } else {
            console.log('Maquina foi solicitada durante a utilização');
        }
    });

    // socket.on(`MACHINE_BLOCK-${machine.id}`, () => {
    //   finishOperation();
    // });
};

finishOperation = (user) => {
    clearInterval(timerId);
    timerId = null;
    blocksMachine(socket, user);
    //console.log("intervalue", timerId);
    //emite consumo final
    const state = getState();
    if (state.active) {
        endCount();
        setTimeout(() => {
            console.log('Final: ', getConsume());
            console.log('User Id', user.userId);
            socket.emit(
                'MACHINE_CONSUMPTION_TOTALS',
                {
                    userId: user.userId,
                    consume: getConsume(),
                },
                process.env.MACHINENUMBER
            );
        }, 1000);
    }
};

module.exports = {
    socketManager: function () {
        //console.log("test")
        connect();
    },
};
