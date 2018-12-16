import createLock from 'flexlock/createLock'
import createLocker from 'flexlock/createLocker'

declare module "flexlock" {
  const FlexLock = { createLock: createLock, createLocker: createLocker } 
  export default FlexLock
}
