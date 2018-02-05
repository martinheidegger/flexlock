import createLock from './createLock'
import createLocker from './createLocker'

declare module 'flexlock' {
  export const createLock = createLock
  export const createLocker = createLocker
}
