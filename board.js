var five = require("johnny-five");
var Raspi = require("raspi-io").RaspiIO;
var board = new five.Board({
  io: new Raspi()
});
var _ = require("lodash");
var solenoideValve;
var sensorFlow;
const {
  getState,
  setState,
  startMachine,
  endCount
} = require("./machineState");

boardStart = () => {
  console.log("Board Starting...");
  board.on("ready", function() {
    // Board Started
    solenoideValve = new five.Relay(27);
    solenoideValve.close();
    sensorFlow = new five.Pin(28);

    sensorFlow.read(function(error, value) {
      // console.log(value);
      const state = getState();
      if (state.active) {
        handleConsume(value);
      }
    });
  });
};

releaseMachine = () => {
  solenoideValve.open();
};

blocksMachine = () => {
  //bloquea a chopeira
  //print
  if (getState().active) {
    solenoideValve.close();

    //console.log(`${state.flowCount}.....`);
    // setTimeout(() => {
    //   console.log(
    //     `${state.flowCount} - Operação finalizada: ${(
    //       state.flowCount * flowCountPerLiter
    //     ).toFixed(2)} ml `
    //   );
    // }, 3500);
  }
};

module.exports = { boardStart, releaseMachine, blocksMachine };
