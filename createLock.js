'use strict'
function waitForPrevious (prevLock, timeout, unlock) {
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

module.exports = function createLock (onUnlocked) {
  let currentLock

  function lockProcess (process, timeout) {
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
      return waitForPrevious(prevLock, timeout, unlock)
    }
    return Promise.resolve(unlock)
  }

  return function lock (process, timeout) {
    if (typeof process === 'number') {
      return lockProcess(null, process)
    }
    if (typeof process === 'function') {
      return lockProcess(null, timeout)
        .then(function (unlock) {
          return process()
            .then(function (result) {
              unlock()
              return Promise.resolve(result)
            })
            .catch(function (err) {
              unlock(err)
              return Promise.reject(err)
            })
        })
    }
    return lockProcess(null, timeout)
  }
}
