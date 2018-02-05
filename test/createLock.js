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

test('Multiple locks will call onUnlocked', function (t) {
  t.plan(1)
  const lock = createLock(function () {
    t.ok('Lock called!')
  })
  return Promise.all([
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

function delayedResolve (data, timeout) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(data)
    }, timeout || 100)
  })
}
