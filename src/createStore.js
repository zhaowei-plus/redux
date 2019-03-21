import $$observable from 'symbol-observable'

// 引入一些预定义的保留的 action type。
import ActionTypes from './utils/actionTypes'

// 判断一个对象是否是纯对象。
import isPlainObject from './utils/isPlainObject'

// 使用 redux 最主要的 API，就是这个 createStore，它用于创建一个 redux store，为你提供状态管理。
// 它接受三个参数（第二三个可选):
// 合并之后的reducer，用于改变 redux store 的状态；
// 第二个是初始化的 store, 即最开始时候 store 的快照；
// 第三个参数是由 applyMiddleware 函数返回的 enhancer 对象，使用中间件必须提供的参数。

/**
 * 创建一个 redux store，提供状态管理服务
 * @param {function} reducer 函数，返回下一个状态，接受两个参数：当前状态 和 触发的 action
 * @param {Object} preloadedState 初始状态对象，可以很随意指定，比如服务端渲染的初始状态，但是如果使用 combineReducers 来生成 reducer，那必须保持状态对象的 key 和 combineReducers 中的 key 相对应
 * @param {function} store 的增强器函数，可以指定为中间件，持久化 等，但是这个函数只能用 Redux 提供的 applyMiddleware 函数来进行生成
 *
 * */
export default function createStore(
  reducer, /* 合并之后的reducer */
  preloadedState, /* 预加载（初始化）的状态，可随意指定，比如服务器端渲染的初始状态，但是如果使用 combineReducers 来生成 reducer，那必须保持状态对象的 key 和 combineReducers 中的 key 相对应； */
  enhancer /*  */
) {
  // 下面这一段基本可以不看，它们是对参数进行适配的。
  /*************************************参数适配****************************************/
  if (
    (typeof preloadedState === 'function' && typeof enhancer === 'function') ||
    (typeof enhancer === 'function' && typeof arguments[3] === 'function')
  ) {
    // 如果传递了多个 enhancer，抛出错误。
    throw new Error(
      'It looks like you are passing several store enhancers to ' +
        'createStore(). This is not supported. Instead, compose them ' +
        'together to a single function'
    )
  }
  // 如果没有传递默认的 state（preloadedState 为函数类型，enhancer 为未定义类型），那么传递的
  // preloadedState 即为 enhancer。
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  // 校验 enhancer 应该为一个函数
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }

    // enhancer 接受 createStore 作为参数，对 createStore 的能力进行增强，并返回增强后的  createStore 。
    // 然后再将 reducer 和  preloadedState 作为参数传给增强后的 createStore，最终得到生成的 store
    return enhancer(createStore)(reducer, preloadedState)
  }

  // reducer必须是函数
  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }
  /*********************************************************************************/

  // 初始化参数
  let currentReducer = reducer  // 当前整个reducer
  let currentState = preloadedState // 当前的state,也就是getState返回的值
  let currentListeners = [] // 当前的订阅store的监听器，用于存储通过 store.subscribe 注册的当前的所有订阅者。
  let nextListeners = currentListeners  // 新的 listeners 数组，确保不直接修改 listeners。
  let isDispatching = false // 是否处于 dispatch action 状态中, 默认为false

  // 这个函数用于确保currentListeners 和 nextListeners 是不同的引用
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice()
    }
  }

  // 返回state
  function getState() {
    if (isDispatching) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing. ' +
          'The reducer has already received the state as an argument. ' +
          'Pass it down from the top reducer instead of reading it from the store.'
      )
    }

    return currentState
  }

  // 添加订阅
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.')
    }

    if (isDispatching) {
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing. ' +
          'If you would like to be notified after the store has been updated, subscribe from a ' +
          'component and invoke store.getState() in the callback to access the latest state. ' +
          'See https://redux.js.org/api-reference/store#subscribe(listener) for more details.'
      )
    }

    // 用来判断当前订阅是否已经解绑
    let isSubscribed = true
    // 如果 nextListeners 和 currentListeners 是一个引用，重新复制一个新的
    ensureCanMutateNextListeners()
    nextListeners.push(listener)

    // 注销订阅
    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }

      if (isDispatching) {
        throw new Error(
          'You may not unsubscribe from a store listener while the reducer is executing. ' +
            'See https://redux.js.org/api-reference/store#subscribe(listener) for more details.'
        )
      }

      isSubscribed = false
      // 每次操作 nextListeners 之前先确保可以修改。
      ensureCanMutateNextListeners()
      const index = nextListeners.indexOf(listener)
      // 从nextListeners里面删除，会在下次dispatch生效
      nextListeners.splice(index, 1)
    }
  }

  // 分发action
  function dispatch(action) {
    // action 必须是一个对象
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
          'Use custom middleware for async actions.'
      )
    }
    // type必须要有属性，不能是undefined
    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
          'Have you misspelled a constant?'
      )
    }
    // 禁止在reducers中进行dispatch，因为这样做可能导致分发死循环，同时也增加了数据流动的复杂度
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }

    try {
      isDispatching = true
      // 将当前的状态和 action 传给当前的reducer，用于生成最新的 state
      currentState = currentReducer(currentState, action)
    } finally {
      // 派发完毕
      isDispatching = false
    }

    // 将nextListeners交给listeners
    const listeners = (currentListeners = nextListeners)
    // 在得到新的状态后，依次调用所有的监听器，通知状态的变更
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }

    // 返回当前所使用的 action，这一步是中间件嵌套使用的关键。
    return action
  }

  // 这个函数主要用于 reducer 的热替换。适用于按需加载，代码拆分等场景。
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.')
    }
    // 执行默认的 REPLACE 类型的 action。在 combineReducers 函数中有使用到这个类型。
    currentReducer = nextReducer
    dispatch({ type: ActionTypes.REPLACE })
  }

  // 这是为了适配 ECMA TC39 会议的一个有关 Observable 的提案（参考上方的网址）所写的一个函数。
  // 作用是订阅 store 的变化，适用于所有实现了 Observable 的类库（主要是适配 RxJS）。
  // 我找到了引入这个功能的那个 commit：https://github.com/reduxjs/redux/pull/1632。
  function observable() {
    // outerSubscribe 即为外部的 subscribe 函数。
    const outerSubscribe = subscribe
    // 返回一个纯对象，包含 subscribe 方法。
    return {

      subscribe(observer) {
        if (typeof observer !== 'object' || observer === null) {
          throw new TypeError('Expected the observer to be an object.')
        }

        // 用于给 subscribe 注册的函数，严格按照 Observable 的规范实现，observer 必须有一个 next 属性。
        function observeState() {
          if (observer.next) {
            observer.next(getState())
          }
        }

        observeState()
        const unsubscribe = outerSubscribe(observeState)
        return { unsubscribe }
      },

      // $$observable 即为 Symbol.observable，也属于 Observable 的规范，返回自身。
      [$$observable]() {
        return this
      }
    }
  }

  // 创建一个store时的默认state
  // 用于填充初始的状态树
  dispatch({ type: ActionTypes.INIT })

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
}
