const socket = require("./index.js");
const {
  VERIFY_MACHINE,
  MACHINE_CONNECTED,
  MACHINE_REQUEST,
  MACHINE_BLEED,
  MACHINE_BLEED_FINISH,
  MACHINE_BLEED_TOTALS
} = require("./Events");

const MACHINENUMBER = process.env.MACHINENUMBER;
const { releaseMachine, blocksMachine, flowCountPerLiter } = require('./board');

const {
  getState,
  getConsume,
  startCount,
  endCount
} = require("./machineState");

var machine = {};
var timerId = null;
var autoBlock = null;
var countVerification = 0;

connect = () => {
  console.log("Connected");
  socket.emit(VERIFY_MACHINE);
  socket.off(VERIFY_MACHINE).on(VERIFY_MACHINE, result => {
    // console.log("aqui entao")
    setMachine(result);
  });
};

setMachine = result => {
  // console.log("aqui");
  console.log(result);
  if (result.machine !== null) {
    socket.emit(MACHINE_CONNECTED, {
      ...result.machine,
      v: process.env.VERSION
    });
    machine = result.machine;
    socket.off(VERIFY_MACHINE);
    openMachine();
  }
};

openMachine = () => {
  // console.log(`${MACHINE_REQUEST}-${MACHINENUMBER}`);
  //console.log(machine);
  console.log("Preparando maquina...");
  configOperation();
  configBleed();
  // socket.on(`MACHINE_BLOCK-${machine.id}`, () => {
  //   finishOperation();
  // });
  console.log("Maquina pronta!");
};

verifiConsume = user => {
  timerId = setTimeout(function() {
    countVerification++;
    const state = getState();

    if (autoBlock !== null && state.flowCount >= 5) {
      clearTimeout(autoBlock);
      autoBlock = null;
    }

    const consume = getConsume();
    if (consume > user.credit) {
      return finishOperation(user);
    }
    if (state.stopCount > 100) return finishOperation(user);
    if (countVerification >= 10) {
      countVerification = 0;
      socket.emit("MACHINE_CONSUMPTION", {
        userId: user.userId,
        consume: consume
      });
    }
    //console.log(state.startCount);
    // interaction++;
    // if (interaction > 20) finishOperation(user, timerId);
    verifiConsume(user);
  }, 50);
};

configOperation = () => {
  socket
    .off(`${MACHINE_REQUEST}-${MACHINENUMBER}`)
    .on(`${MACHINE_REQUEST}-${MACHINENUMBER}`, user => {
      //valida se a maquina esta disponivel
      const state = getState();
      if (!state.active) {
        console.log("Maquina solicitada por: ", user);
        // test();
        startCount();
        releaseMachine();
        countVerification = 0;
        console.log("MACHINE_CONSUMPTION started");
        autoBlock = setTimeout(() => {
          finishOperation(user);
        }, 7000);

        verifiConsume(user);
      } else {
        console.log("Maquina foi solicitada durante a utilização");
      }
    });
};

finishOperation = user => {
  clearTimeout(timerId);
  timerId = null;
  blocksMachine();
  //console.log("intervalue", timerId);
  //emite consumo final
  const state = getState();
  if (state.active) {
    endCount();
    // const consume = user.credit
    setTimeout(() => {
      const consume = getConsume();
      console.log("Final: ", getConsume());
      console.log("User Id", user.userId);
      socket.emit(
        "MACHINE_CONSUMPTION_TOTALS",
        {
          userId: user.userId,
          reference: user.reference,
          consume: consume > user.credit ? user.credit : consume
        },
        process.env.MACHINENUMBER
      );
    }, 500);
  }
};

configBleed = () => {
  socket
    .off(`${MACHINE_BLEED}-${MACHINENUMBER}`)
    .on(`${MACHINE_BLEED}-${MACHINENUMBER}`, user => {
      //valida se a maquina esta disponivel
      const state = getState();
      if (!state.active) {
        socket
          .off(`${MACHINE_BLEED_FINISH}-${MACHINENUMBER}`)
          .on(`${MACHINE_BLEED_FINISH}-${MACHINENUMBER}`, () => {
            finishBleed();
            socket.off(`${MACHINE_BLEED_FINISH}-${MACHINENUMBER}`);
          });
        console.log("Sangria solicitada por: ", user);
        // test();
        startCount();
        releaseMachine();
        console.log("MACHINE_BLEED started");
        var autoBlock = setTimeout(() => finishBleed(user), 15000);

        timerId = setInterval(function() {
          const state = getState();
          if (autoBlock !== null && state.flowCount >= 5) {
            clearTimeout(autoBlock);
            autoBlock = null;
          }

          if (state.stopCount > 500) finishBleed();
        }, 1000);
      } else {
        console.log("Maquina foi solicitada durante a utilização");
      }
    });
};

finishBleed = () => {
  clearInterval(timerId);
  timerId = null;
  blocksMachine();
  //console.log("intervalue", timerId);
  //emite consumo final
  const state = getState();
  if (state.active) {
    endCount();
    setTimeout(() => {
      console.log("Final Sangria: ", getConsume());
      socket.emit(
        MACHINE_BLEED_TOTALS,
        {
          consume: getConsume()
        },
        process.env.MACHINENUMBER
      );
    }, 500);
  }
};

module.exports = {
  socketManager: function() {
    //console.log("test")
    connect();
  }
};
