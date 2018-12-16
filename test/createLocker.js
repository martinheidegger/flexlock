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

test('Release for locks should be triggered', function (t) {
  const lock = createLocker()
  const stack = []
  return Promise.all([
    lock('a', () => {
      stack.push('a')
      return delayedResolve('x', 10)
    }).then(() => stack.push('a-done')),
    lock('b').then(unlock => {
      stack.push('b')
      stack.push('b-done')
      unlock()
    }),
    lock.released('b', () => stack.push('b-release')),
    lock.released('a', () => stack.push('a-release')),
    lock.released(() => stack.push('release'))
  ]).then(() => {
    t.deepEqual(stack, [
      'a',
      'b',
      'b-done',
      'b-release',
      'a-done',
      'a-release',
      'release'
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
