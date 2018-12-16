'use strict'
const createRawLock = require('./lib/createRawLock.js')
const globalLock = require('./lib/globalLock.js')

function waitForPromise (promise, timeout, unlock) {
  if (timeout === undefined) {
    return promise.then(function () {
      return Promise.resolve(unlock)
    })
  }
  return new Promise(function (resolve, reject) {
    promise.then(function () {
      clearTimeout(t)
      resolve(unlock)
    })
    let t = setTimeout(function () {
      const e = new Error('Timeout[t=' + timeout + ']')
      e.code = 'ETIMEOUT'
      e.timeout = timeout
      reject(e)
    }, timeout)
  })
}

function wrapProcess (process) {
  return function wrapped (unlock) {
    return process()
      .then(function passResult (result) {
        unlock()
        return Promise.resolve(result)
      })
      .catch(function passError (err) {
        unlock(err)
        return Promise.reject(err)
      })
  }
}

function createLock (onReleased) {
  let currentLock = null
  const global = globalLock(function () {
    return currentLock === null
  })

  function lockPromise (timeout) {
    const prevLock = currentLock
    const thisLock = createRawLock()
    currentLock = thisLock
    const unlock = function () {
      if (currentLock === thisLock) {
        currentLock = null
        global.trigger()
      }
      thisLock.unlock(currentLock)
    }
    if (prevLock !== null) {
      return waitForPromise(prevLock, timeout, unlock)
    }
    global.repeat(onReleased)
    return Promise.resolve(unlock)
  }

  function lock (process, timeout) {
    if (typeof process === 'function') {
      return lockPromise(timeout).then(wrapProcess(process))
    }
    timeout = (typeof process === 'number') ? process : timeout
    return lockPromise(timeout)
  }

  lock.released = global.released

  return lock
}
createLock.default = createLock

module.exports = createLock
