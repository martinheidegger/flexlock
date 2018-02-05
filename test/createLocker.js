'use strict'
const test = require('tap').test
const createLocker = require('../createLocker')

test('Seperate locks may not interfere', function (t) {
  const lock = createLocker()
  let aDone = false
  let bDone = false
  return Promise.all([
    lock('a', () => delayedResolve('x', 100)),
    lock('a', () => {
      aDone = true
      t.equals(bDone, true)
      return Promise.resolve()
    }),
    lock('b', () => delayedResolve('y', 10)),
    lock('b', () => {
      bDone = true
      t.equals(aDone, false)
      return Promise.resolve()
    })
  ])
})

function delayedResolve (data, timeout) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(data)
    }, timeout || 100)
  })
}
