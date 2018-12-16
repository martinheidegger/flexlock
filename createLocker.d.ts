declare module "flexlock/createLock" {

  type callback = () => void
  type unlock = () => void
  type process = (unlock: unlock) => PromiseLike<void>

  interface FlexLock {
    (key: string): Promise<unlock>
    (key: string, timeout: number): Promise<unlock>
    (key: string, process: Process): Promise<void>
    (key: string, process: Process, timeout: number) : Promise<void>

    released(): Promise<void>
    released(key: string): Promise<void>
    released(onReleased: callback)
    released(key: string, onReleased: callback)
  }

  export default function createLocker (onReleased?: callback): FlexLock
}

