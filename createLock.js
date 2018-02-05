'use strict'
function waitForPreviousLock (prevLock, timeout, unlock) {
  if (timeout === undefined) {
    return prevLock.then(function () {
      return Promise.resolve(unlock)
    })
  }
  return new Promise(function (resolve, reject) {
    prevLock.then(function () {
      clearTimeout(t)
      resolve(unlock)
    })
    let t = setTimeout(function () {
      const e = new Error('Timeout[t=' + timeout + ']')
      e.code = 'ETIMEOUT'
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

module.exports = function createLock (onUnlocked) {
  let currentLock

  function lockPromise (timeout) {
    let resolveLock
    const prevLock = currentLock
    const thisLock = new Promise(function (resolve) {
      resolveLock = resolve
    })
    currentLock = thisLock

    function unlock () {
      if (currentLock === thisLock) {
        currentLock = null
        onUnlocked && onUnlocked()
      }
      resolveLock()
    }

    if (prevLock) {
      return waitForPreviousLock(prevLock, timeout, unlock)
    }
    return Promise.resolve(unlock)
  }

  return function lock (process, timeout) {
    if (typeof process === 'number') {
      return lockPromise(process)
    }
    if (typeof process === 'function') {
      return lockPromise(timeout).then(wrapProcess(process))
    }
    return lockPromise(timeout)
  }
}
