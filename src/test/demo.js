import { createStore, applyMiddleware, compose } from 'redux'

import thunk from 'redux-thunk'
import createLogger from 'redux-logger'
import api from '../middleware/api'
import rootReducer from '../reducers'
import DevTools from '../containers/DevTools'

export default function configureStore(preloadedState) {
  // 作用：创建一个Redux store来存放应用中所有的state，一个应用只能有个store。函数返回store对象。
  const store = createStore(
    rootReducer,
    preloadedState,
    compose(
      applyMiddleware(thunk, api, createLogger()),
      DevTools.instrument()
    )
  )
  return store
}
