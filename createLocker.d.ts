declare function unlock (): void
declare function locker (id: string, timeout?: number): Promise<unlock>
declare function locker (id: string, process: () => Promise<X>, timeout?: number): Promise<X>

declare module 'flexlock/createLocker' {
  export default function createLocker (): locker
}
