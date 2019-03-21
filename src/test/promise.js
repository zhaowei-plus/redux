"use strict";
exports.default = promiseMiddleware;

function promiseMiddleware(store) {
  var dispatch = store.dispatch;
  return function (next) {
    return function (action) {
      return action.then ? action.then(dispatch) : next(action)
    };
  };
}


// 什么都不干的中间件
const doNothingMidddleware = ({dispatch, getState}) => next => action => next(action)

// next 是一个函数，如果调用了他，就代表这个中间件完成了自己的功能，并将action控制权交给下一个中间件
// 注：这个函数不是处理action对象的函数，返回的以action为参数的阐述才是


const doNothingModdleware = ( { dispatch, getState }) => {
  return function(next) {
    return function(action) {
      next(action);
    }
  }
}

return function(next) {
  return function(action) {
    next(action);
  }
}
