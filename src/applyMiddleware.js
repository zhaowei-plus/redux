import compose from './compose'
// applyMiddleware(thunk, promise, logger)

// 用于应用中间件的函数，可以同时传递多个中间件。
// 中间件的标准形式为：
// const middleware = store => next => action => { /*.....*/ return next(action); }


function promiseMiddleware(store) {
  var dispatch = store.dispatch;
  return function (next) {
    return function (action) {
      return next(action);
    };
  };
}

// applyMiddleware 是个三级柯里化的函数
export default function applyMiddleware(...middlewares) {
  //　返回一个函数，接受　createStore　作为参数。args 参数即为 reducer 和 preloadedState。
  return createStore => (...args) => {

    // 利用传入的createStore和reducer和创建一个store
    const store = createStore(...args)
    // 这里对 dispatch 进行了重新定义，不管传入什么参数，都会报错，这样做的目的是防止你的中间件在初始化的时候就调用 dispatch。
    let dispatch = () => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. ` +
          `Other middleware would not be applied to this dispatch.`
      )
    }

    // 初始化中间件的参数
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }

    /**
     * 遍历中间件，传递参数 middlewareAPI 进行初始化
     * 注：初始化后的中间件会返回新的函数，这个函数接受
     * store.dispatch 方法作为参数，并返回一个替换后的dispatch，作为新的store.dispatch
     * */
    const chain = middlewares.map(middleware => middleware(middlewareAPI))

    /**
     * 调用compose方法将所有的中间件串联起来调用。并用最终处理结果替换store.dispatch 方法，
     * 在之后使用的所有的store.dispatch 方法都已经是替换过的，并入了新的处理逻辑
     * */
    dispatch = compose(...chain)(store.dispatch)

    /**
     * middle 的标准形式：
     * const middleware = ({ getState, dispatch }) => next => action => {
     *    // ....
     *    return next(action);
     * }
     * 这里 next 是经过上一个 middleware 处理了的 dispatch 方法。
     * next(action) 返回的仍然是一个 dispatch 方法。
     */
    return {
      ...store,
      dispatch  // 全新的 dispatch。
    }
  }
}
