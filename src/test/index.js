import { createStore, combineReducers, applyMiddleware }  from '../index';
import reduxPromise from 'redux-promise';

// 创建reducers
const _reducers = {
  items(items = [], { type, payload }){
    // 复制state，避免修改原有state
    let _items = Array.prototype.concat.call([], items);

    if (type === 'ADD_ITEMS') {
      _items.push(payload);
    } else if(type === 'DEL_ITEMS') {
      _items.splice(_items.indexOf(payload), 1);
    }
    return _items;
  },
  isLoading(isLoading = false, { type, payload }) {
    if (type === 'IS_LOADING') {
      return true;
    }
    return false;
  }
}
// 交给 combineReducers 处理，适配 createStore。
const reducers = combineReducers(_reducers);

// 柯里化
const middleware1 = store => next => action => {
  return action.then ? action.then(next) : next(action);
}
const middleware2 = store => next => action => {
  return action.then ? action.then(next) : next(action);
}
const middleware3 = store => next => action => {
  return action.then ? action.then(next) : next(action);
}
// createStore(reducer, [initState, enhancer])------redux中的方法
const store = createStore(reducers, applyMiddleware(middleware3, middleware2, middleware1));

// store.dispatch({
//   type: 'ADD_ITEMS',
//   payload: '123'
// });

// store.dispatch({
//   type: 'ADD_ITEMS',
//   payload: '13'
// });

// store.dispatch({
//   type: 'DEL_ITEMS',
//   payload: '123'
// })

store.subscribe(() => {
  console.log(store.getState());
})

store.dispatch(new Promise((resolve, reject) => {
  window.setTimeout(() =>{
    resolve({ type: 'ADD_ITEMS', payload: 100 });
  }, 1000);
}))
