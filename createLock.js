'use strict'
module.exports = function createLock (onUnlocked) {
  let currentLock

  return function lock (process, timeout) {
    if (typeof process === 'number') return lock(null, process)
    if (typeof process === 'function') {
      return lock(null, timeout)
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
      if (timeout !== undefined) {
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
      return prevLock.then(function () {
        return Promise.resolve(unlock)
      })
    }
    return Promise.resolve(unlock)
  }
}
