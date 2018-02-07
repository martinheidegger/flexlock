# _flexlock_...


<a href="https://travis-ci.org/martinheidegger/flexlock"><img src="https://travis-ci.org/martinheidegger/flexlock.svg?branch=master" alt="Build Status"/></a>
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Maintainability](https://api.codeclimate.com/v1/badges/64b42212bd9ebab25cda/maintainability)](https://codeclimate.com/github/martinheidegger/flexlock/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/64b42212bd9ebab25cda/test_coverage)](https://codeclimate.com/github/martinheidegger/flexlock/test_coverage)

...is a **small**, **memory-concious**, **flexible**, **Promise**-based locking library without dependencies.

`npm i flexlock --save`

A in-memory locking library like [`mutexify`](https://github.com/mafintosh/mutexify), [`mutex-js`](https://github.com/danielglennross/mutex-js), [`await-lock`](https://www.npmjs.com/package/await-lock), and [many more](https://www.npmjs.com/search?q=promise+lock), but with more flexibility in how
to use it to be both sturdier and more practical.


# _simple_ API when that suffices

```javascript
const createLock = require('flexlock/createLock') // require('flexlock').createLock works too

const lock = createLock()

lock(async () => {
  // done before the next block
})
lock(async () => {
  // done after the previous block
})
```

### _Timeouts_ in case anther lock never returns

```javascript
lock(() => new Promise()) // This never releases the lock
lock(async () => {}, 500)
  .catch(err => {
    err.code === 'ETIMEOUT'
  })
```

### _Propagation_ of errors and results

```javascript
async function business () {
  try {
    const important = await lock(async () => {
      // do your thing
      return important
    })
    // You can use the important data here.
  } catch (err) {
    // Woops, something happened!
  }
}
```

### _Dedicated locks_ for more readable async code

```javascript
async function business () {
  const unlock = await lock()
  // do your thing
  unlock()
}
```

### _Namespace_ support for multiple lockers

```javascript
const createLocker = require('flexlock/createLocker') // require('flexlock').createLocker works too

const lock = createLocker()

async function business (id, content) {
  await lock(id, async () => {
    // do your thing, locked to this id!
  })
}
```

_Implementation note: The locker will use `createLock` per id. It will keep the created lock until all locks
for an id are released. Then it will pass the lock to the garbage collector._

### License

MIT
