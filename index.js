'use static'
const flexLock = {
  createLocker: require('./createLocker'),
  createLock: require('./createLock')
}
flexLock.default = flexLock

module.exports = flexLock
