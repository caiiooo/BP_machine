const moment = require("moment");
const FACTOR = process.env.FACTOR;

const defaultState = {
  flowCount: 0,
  active: false,
  startTime: null,
  endTime: null,
  stopCount: 0
};
var state = { ...defaultState };

startCount = () => {
  return (state = {
    flowCount: 0,
    active: true,
    startTime: null,
    endTime: null,
    stopCount: 0
  });
};
var lastRead = 0;

endCount = () => {
  setState({ active: false, endTime: moment() });
};

handleConsume = value => {
  //state.value.push(value);
  // if (lastRead===0 && value ===1) {
  //console.log(state.stopCount)
  if (lastRead !== value) {
    // if (state.startTime === null) state.startTime = moment();
    if (state.flowCount > 5 && state.startTime === null)
      state.startTime = moment();
    state.flowCount = state.flowCount + 1;
    lastRead = value;
    state.stopCount = 0;
  } else {
    if (state.startTime !== null) state.stopCount = state.stopCount + 1;
  }
};
getConsume = () => {
  //console.log(state)
  if (state.startTime === null) {
    return 0;
  } else if (state.endTime === null) {
    //console.log(state.startTime)
    // var duration = moment().diff(state.startTime);
    // if (state.flowCount > 3) {
    //   var flowPerSecond = state.flowCount / duration;
    //   console.log("Duration:", duration);
    //   console.log("Pulson por minuto: ", flowPerSecond);
    // }

    // console.log("factor: ", FACTOR);
    // console.log("FlowCount: ", state.flowCount);
    // console.log("ML: ", state.flowCount * FACTOR + "ml");
    return (state.flowCount * FACTOR).toFixed(2)
  } else {
    // var duration = state.endTime.diff(state.startTime);
    // var flowPerSecond = state.flowCount / duration;
    // console.log("Pulson por minuto: ", flowPerSecond);
    return (state.flowCount * FACTOR).toFixed(2);
  }
};

setState = newState => {
  return (state = { ...state, ...newState });
};

getState = () => {
  return state;
};

module.exports = {
  handleConsume,
  getConsume,
  startCount,
  endCount,
  setState,
  getState
};
