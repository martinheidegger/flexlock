declare module "flexlock/createLocker" {

  type callback = () => void
  type unlock = () => void
  type process = (unlock: unlock) => PromiseLike<void>

  interface FlexLock {
    (key: string): Promise<unlock>
    (key: string, timeout: number): Promise<unlock>
    (key: string, process: process): Promise<void>
    (key: string, process: process, timeout: number) : Promise<void>

    released(): Promise<void>
    released(key: string): Promise<void>
    released(onReleased: callback): void
    released(key: string, onReleased: callback): void
  }

  export default function createLocker (onReleased?: callback): FlexLock
}

