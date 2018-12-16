'use strict'
module.exports = function createRawLock () {
  let resolveLock
  const lock = new Promise(function (resolve) {
    resolveLock = resolve
  })
  lock.unlock = function () {
    resolveLock()
  }
  return lock
}
