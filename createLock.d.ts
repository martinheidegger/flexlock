declare module "flexlock/createLock" {

  type callback = () => void
  type unlock = () => void
  type process = (unlock: unlock) => PromiseLike<void>

  interface FlexLock {
    (): Promise<unlock>
    (timeout: number): Promise<unlock>
    (process: process): Promise<void>
    (process: process, timeout: number) : Promise<void>

    released(): Promise<void>
    released(onReleased: callback)
  }

  export default function createLock (onReleased?: callback): FlexLock
}

