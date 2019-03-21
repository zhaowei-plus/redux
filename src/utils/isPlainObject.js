/**
 * @param {any} obj The object to inspect.
 * @returns {boolean} True if the argument appears to be a plain object.
 */

/**
 * 判断参数是否为一个纯对象，即该对象是通过'{}' 或者 'new Object()' 创建的，其构造函数为Object
 * 用于判断传入的对象是否是纯对象，因为 redux 要求 action 和 state 是一个纯对象
 * */
/**
 * 判断一个参数是否是纯对象，纯对象的定义就是它的构造函数为 Object。
 * 比如： { name: 'isPlainObject', type: 'funciton' }。
 * 而 isPlainObject 这个函数就不是纯对象，因为它的构造函数是 Function。
 * @param {any} obj 要检查的对象。
 * @returns {boolean} 返回的检查结果，true 代表是纯对象。
 */

export default function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null)
    return false

  // 获取对象原型
  let proto = obj
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(obj) === proto
}
