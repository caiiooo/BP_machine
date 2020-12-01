var five = require("johnny-five");
var Raspi = require("raspi-io").RaspiIO;
var board = new five.Board(
  {
  io: new Raspi()
}
);
var _ = require("lodash");
var timeFlag = true;
const FATOR = 9.66;
board.on("ready", function() {
  var relay = new five.Relay(27);
  var pin = new five.Pin(28);
  // var button = new five.Button(10);
  var flowCount = 0;
  var currentPin = 0;
  var values = [];
  var active = true;
  // button.on("hold", function() {
  //   relay.toggle();
  //   // if (flowCount)
  //close();
  //   if (!active) {
  //     flowCount = 0;
  //     active = true;
  //     values = [];
  //   }
  // });
  relay.open();
  setInterval(() => {
    relay.close();
  }, 1000);
  pin.read(function(error, value) {
    // console.log(error)
    // console.log(flowCount);
    verificClose(value);
    // if (flowCount*FATOR >= 500) close();
    //console.log(value === 1)
    if (currentPin !== value) {
      flowCount++;

      console.log(`${(flowCount * FATOR).toFixed(2)} ml `);
      currentPin = value;
    }
  });

  function verificClose(value) {
    //values.push(value);
    // if (values.length > 250) {
    //console.log(values.splice(values.length - 5, values.length - 1))
    // var newArray = _.filter(
    //   values.splice(values.length - 5, values.length - 1),
    //   element => element !== values[values.length - 1]
    // );
    //console.log(newArray.length)
    // if (newArray.length < 1) {
    //   close();
    // }
    // }
  }

  function close(timeFlag) {
    //bloquea a chopeira
    //print
    if (active) {
      console.log(`${flowCount}.....`);
      active = false;
      relay.close();
      setTimeout(() => {
        console.log(
          `${flowCount} - Operação finalizada: ${(flowCount * FATOR).toFixed(
            2
          )} ml `
        );
      }, 3500);
    }
  }
});
