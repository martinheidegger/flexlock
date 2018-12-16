'use strict'
const test = require('tap').test
const createLock = require('../createLock')

test('Lock with deferred unlock', function (t) {
  const lock = createLock()
  let firstLockDone = false
  return Promise.all([
    lock().then(function (unlock) {
      return delayedResolve()
        .then(function (resolve) {
          firstLockDone = true
          unlock()
        })
    }),
    lock().then(function (unlock) {
      t.equals(firstLockDone, true)
    })
  ])
})

test('Lock with timeout', function (t) {
  const lock = createLock()
  return Promise.all([
    lock().then(function (unlock) {
      return delayedResolve().then(unlock)
    }),
    lock(10)
      .then(function () {
        t.fail('passed regularily')
      })
      .catch(function (err) {
        t.equals(err.code, 'ETIMEOUT')
        t.equals(err.message, 'Timeout[t=10]')
        t.equals(err.timeout, 10)
      })
  ])
})

test('One lock with promise in handler and timeout', function (t) {
  const lock = createLock()
  return lock(() => Promise.reject(new Error('a')), 10)
    .then(function () {
      t.fail('The error should be propagated')
    })
    .catch(function (err) {
      t.equals(err.message, 'a', 'error a is properly passed through from the promise')
    })
})

test('Two locks with promise in handler and timeout', function (t) {
  const lock = createLock()
  return Promise.all([
    lock(() => Promise.resolve()),
    lock(() => Promise.reject(new Error('a')), 100)
      .then(function () {
        t.fail('The error should be propagated')
      })
      .catch(function (err) {
        t.equals(err.message, 'a', 'error a is properly passed through from the promise')
      }),
    lock(() => Promise.resolve())
  ])
})

test('Multiple locks will call onReleased', function (t) {
  const lock = createLock(function () {
    t.ok('onRelease called!')
    t.end()
  })
  Promise.all([
    lock(() => Promise.resolve()),
    lock(() => Promise.resolve())
  ])
})

test('Lock with promise in handler', function (t) {
  const lock = createLock()
  let firstLockDone = false
  return Promise.all([
    lock(() => delayedResolve('lockA')).then(function (data) {
      firstLockDone = true
      t.equals(data, 'lockA', 'data a is properly passed through from the promise')
    }),
    lock(() => Promise.resolve('lockB'))
      .then(function (data) {
        t.equals(data, 'lockB', 'data is properly passed through from the promise')
        t.equals(firstLockDone, true)
      })
  ])
})

test('Pass through error in handler process', function (t) {
  const lock = createLock()
  return lock(() => Promise.reject(new Error('a')))
    .then(function () {
      t.fail('The error should be propagated')
    })
    .catch(function (err) {
      t.equals(err.message, 'a', 'error a is properly passed through from the promise')
    })
})

test('Untriggered lock is released', function (t) {
  const lock = createLock()
  lock.released(function () {
    t.end()
  })
})

test('A triggered lock blocks a release', function (t) {
  const lock = createLock()
  let count = 0
  lock(function () {
    t.equals(count++, 0)
    return Promise.resolve()
  })
  lock.released(function () {
    t.equals(count++, 1)
    t.end()
  })
})

test('Releases work as promised', function (t) {
  const lock = createLock()
  const stack = []

  return Promise.all([
    lock.released().then(function a () {
      stack.push('a')
    }),
    lock.released().then(function b () {
      stack.push('b')
    })
  ]).then(function () {
    t.deepEqual(stack, ['a', 'b'])
  })
})

test('onReleased is call every time the lock is unlocked', function (t) {
  const stack = []
  const lock = createLock(function () {
    stack.push('released')
  })
  lock(function a () {
    stack.push('a')
    return Promise.resolve()
  })
  return lock(function b () {
    stack.push('b')
    return Promise.resolve()
  })
    .then(() => delayedResolve(null, 2))
    .then(function () {
      return lock(function c () {
        stack.push('c')
        return new Promise(function (resolve) {
          setTimeout(resolve, 10)
        })
      })
    })
    .then(() => delayedResolve(null, 2))
    .then(function () {
      return lock(function d () {
        stack.push('d')
        return Promise.resolve()
      })
    })
    .then(() => delayedResolve(null, 2))
    .then(function () {
      t.deepEqual(stack, [
        'a', 'b', 'released', 'c', 'released', 'd', 'released'
      ])
    })
})

test('release started after a lock shouldnt misfire', function (t) {
  const lock = createLock()
  const stack = []
  return Promise.all([
    lock.released().then(function () {
      stack.push('release')
    }),
    lock(function a () {
      stack.push('a')
      return Promise.resolve()
    })
  ]).then(function () {
    t.deepEqual(stack, [
      'a', 'release'
    ])
  })
})

test('released started after a lock shouldnt misfire with a delay', function (t) {
  const lock = createLock()
  const stack = []
  return Promise.all([
    lock.released().then(function () {
      stack.push('release')
    }),
    lock().then(function a (unlock) {
      stack.push('a')
      setTimeout(unlock, 10)
    })
  ]).then(function () {
    t.deepEqual(stack, [
      'a', 'release'
    ])
  })
})

function delayedResolve (data, timeout) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(data)
    }, timeout || 100)
  })
}
