/**
 * store
 * dispatch
 * action
 * */

const action = {
  type: 'add',
  payload: {
    count: 5,
  }
};

const initialState = {
  count: 0,
};

const reducer = (state = initialState, { type, payload }) => {
  if (type === 'add') {
    return {
      ...state,
      count: state.count + payload.count,
    }
  }
}

const createStore = (reducer, preloadState) => {
  const currentReducer = reducer;
  let state = preloadState;
  let listeners = [];


  const getState = () => {
    return state;
  }

  const dispatch = (action) => {
    // 触发reducer，更新state
    state = currentReducer(state, action);
    listeners.forEach(d => d());

    return action;
  }

  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(d => d !== listener);
    }
  }

  return {
    getState,
    dispatch,
    subscribe,
  }
}

const store = createStore(reducer);

console.log(store.getState());

const unsubscribe = store.subscribe(() => {
  console.log('1');
});

store.dispatch(action);
store.dispatch(action);
console.log(store.getState());
unsubscribe();
store.dispatch(action);
