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

function createRawLock (onUnlocked) {
  let resolveLock
  const lock = new Promise(function (resolve) {
    resolveLock = resolve
  })
  lock.unlock = function (currentLock) {
    if (currentLock === lock) {
      currentLock = null
      onUnlocked && onUnlocked()
    }
    resolveLock()
  }
  return lock
}

module.exports = function createLock (onUnlocked) {
  let currentLock

  function lockPromise (timeout) {
    const prevLock = currentLock
    const thisLock = createRawLock(onUnlocked)
    currentLock = thisLock
    const unlock = function () {
      thisLock.unlock(currentLock)
    }

    if (prevLock) {
      return waitForPreviousLock(prevLock, timeout, unlock)
    }
    return Promise.resolve(unlock)
  }

  return function lock (process, timeout) {
    if (typeof process === 'function') {
      return lockPromise(timeout).then(wrapProcess(process))
    }
    timeout = (typeof process === 'number') ? process : timeout
    return lockPromise(timeout)
  }
}
