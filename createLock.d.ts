declare function unlock (): void
declare function locker (process: () => Promise<X>, timeout?: number): Promise<X>
declare function locker (timeout?: number): Promise<unlock>

declare module 'flexlock/createLock' {
  export default function createLock (onUnlocked: Function): locker
}
