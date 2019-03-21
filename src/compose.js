/**
 * compose函数实现：
 *  实现函数数组的从右到左依次执行
 *
 *  接受一组函数参数，从右到左来组合多个函数，然后返回一个组合函数
 */
export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }
  // 通过Array.prototype.reduce 实现中间件的嵌套调用，返回一个全新的函数，
  // 可以接受新的参数（上一个中间件处理过的dispatch），最终返回一个全新
  // 的包含新逻辑的dispatch方法。
  /**
   * reduce 实现中间件的嵌套调用，返回一个全新的函数。
   * 过程：
   *  接受上一个函数处理过的结果作为参数（上一个中间件处理过的dispatch），
   *  并返回一个新的包含新逻辑的dispatch方法
   * */
  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
