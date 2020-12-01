require('dotenv').config();
const socketUrl = process.env.OPERATION_SERVICE_URL;
const { authMachine } = require('./service/authService');

conectToSocket = () => {
    console.log('conectando...');
    authMachine(process.env.MACHINENUMBER, process.env.AUTH_TOKEN)
        .then((result) => {
            if (result.data && result.data.token) {
                console.log(socketUrl);
                const io = require('socket.io-client');
                const socket = io(socketUrl, {
                    query: 'token=' + result.data.token,
                });
                module.exports = socket;

                const { socketManager } = require('./socketManager');
                // const { boardStart } = require("./board");
                //console.log(process.env.MY_VARIABLE);
                socket.on('connect', socketManager);

                socket.on('disconnect', () => {
                    // setTimeout(() => conectToSocket(), 10000);
                    console.log('disconnect');
                    setTimeout(() => conectToSocket(), 10000);
                    conectToSocket();
                });

                // socket.on('error', (reason) => {
                //     console.log(reason);
                // });

                boardStart();
            }
        })
        .catch((err) => {
            console.log(err);
            console.log(err.message);
        });
};

conectToSocket();
