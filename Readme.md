# _flexlock_...


[![Build Status](https://travis-ci.org/martinheidegger/flexlock.svg?branch=master)](https://travis-ci.org/martinheidegger/flexlock)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

...is a **memory-efficient**, **flexible**, **Promise**-based logging without dependencies.

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
  // done after the next block
})
```

## _Timeouts_ in case anther lock never returns

```javascript
lock(() => new Promise()) // This never releases the lock
lock(async () => {}, 500)
  .catch(err => {
    err.code === 'ETIMEOUT'
  })
```

## _Propagation_ of errors and results

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

## _Dedicated locks_ for more readable async code

```javascript
async function business () {
  const unlock = await lock()
  // do your thing
  unlock()
}
```

## _Namespace_ support for multiple lockers

```javascript
const createLocker = require('flexlock/createLocker')

const lock = createLocker()

async function business (id, content) {
  await lock(id, async () => {
    // do your thing, locked to this id!
  })
}
```

## License

MIT
