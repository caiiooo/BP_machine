const { replay, flow } = require("./board");
var currentPin = 0;


flow.read(function(error, value) {
  console.log(flowCount);
  if (currentPin !== value) {
    flowCount++;
    //console.log(`${(flowCount * 1.7).toFixed(2)} ml `);
    currentPin = value;
  }
  // verificClose(value);
  // if (flowCount > 295) close();
});

open = () => {};

verificClose = value => {
  values.push(value);
  if (values.length > 150) {
    //console.log(values.splice(values.length - 4, values.length - 1))
    var newArray = _.filter(
      values.splice(values.length - 4, values.length - 1),
      element => element !== values[values.length - 1]
    );
    //console.log(newArray.length)
    if (newArray.length < 1) {
      close();
    }
  }
};

close = timeFlag => {
  //bloquea a chopeira
  //print
  if (active) {
    console.log(".....");
    active = false;
    relay.close();
    setTimeout(() => {
      console.log(`Operação finalizada: ${(flowCount * 1.7).toFixed(2)} ml `);
    }, 3500);
  }
};

//module.exports = 