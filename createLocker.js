'use strict'
const createLock = require('./createLock')

module.exports = function () {
  const locks = {}

  return function (key, process, timeout) {
    let lock = locks[key]
    if (!lock) {
      lock = createLock(function () {
        delete locks[key]
      })
      locks[key] = lock
    }
    return lock(process, timeout)
  }
}
