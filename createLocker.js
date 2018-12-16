'use strict'
const createLock = require('./createLock.js')
const globalLock = require('./lib/globalLock.js')

function createLocker (onEmpty) {
  const locks = {}
  const global = globalLock(function () {
    for (const _ in locks) {
      return false
    }
    return true
  })

  function getLock (key) {
    let lock = locks[key]
    if (!lock) {
      lock = createLock(function () {
        delete locks[key]
        setImmediate(function () {
          global.trigger()
        })
      })
      locks[key] = lock
    }
    global.repeat(onEmpty)
    return lock
  }

  function createLocker (key, process, timeout) {
    return getLock(key)(process, timeout)
  }

  function released (key, onReleased) {
    if (typeof key === 'function') {
      return released(null, key)
    }
    if (key) {
      return getLock(key).released(onReleased)
    }
    return global.released(onReleased)
  }

  createLocker.released = released

  return createLocker
}
createLocker.default = createLocker
module.exports = createLocker
