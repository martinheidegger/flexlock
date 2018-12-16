'use strict'
const createRawLock = require('./createRawLock.js')

module.exports = function (isReleased) {
  var lock = null

  function createLock () {
    if (lock !== null) {
      return lock
    }

    lock = createRawLock()
    lock.then(function () {
      lock = null
    })
    trigger()
    return lock
  }

  function trigger () {
    setImmediate(function () {
      if (lock !== null && isReleased()) {
        lock.unlock()
      }
    })
  }

  function released (onEmpty) {
    if (typeof onEmpty === 'function') {
      return createLock().then(onEmpty)
    }
    return createLock()
  }

  return {
    trigger: trigger,
    released: released,
    repeat: function (onReleased) {
      if (lock === null && onReleased !== undefined) {
        released(onReleased)
      }
    }
  }
}
