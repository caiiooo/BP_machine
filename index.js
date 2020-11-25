require("dotenv").config();
// const socketUrl = "http://napontadosdedos.com.br:21650";
// const socketUrl = "http://localhost:21650";
const socketUrl = process.env.OPERATION_SERVICE_URL;
const { authMachine } = require("./service/authService");

authMachine(process.env.AUTH_TOKEN)
  .then(result => {
    if (result.data && result.data.token) {
      const io = require("socket.io-client");
      const socket = io(socketUrl, {
        query: "token=" + result.data.token
      });
      module.exports = socket;

      const { socketManager } = require("./socketManager");
      const { boardStart } = require("./board");
      //console.log(process.env.MY_VARIABLE);
      socket.on("connect", socketManager);

      socket.on("error", reason => {
        console.log(reason);
      });

      boardStart();
    }
  })
  .catch(err => {
    console.log(err);
    console.log(err.message);
  });
