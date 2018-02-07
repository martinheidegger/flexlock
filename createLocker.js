'use strict'
const createLock = require('./createLock')

function createLocker () {
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
createLocker.default = createLocker
module.exports = createLocker
