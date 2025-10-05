declare module 'bluebird' {
  export = Bluebird;
  export as namespace Bluebird;
  
  interface Bluebird<T> extends Promise<T> {
    mapSeries<R, U>(iterable: Iterable<R>, mapper: (item: R, index: number, arrayLength: number) => U | Promise<U>): Bluebird<U[]>;
  }
  
  interface BluebirdConstructor {
    new <T>(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: Error) => void) => void): Bluebird<T>;
    <T>(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: Error) => void) => void): Bluebird<T>;
    mapSeries<R, U>(iterable: Iterable<R>, mapper: (item: R, index: number, arrayLength: number) => U | Promise<U>): Bluebird<U[]>;
  }
  
  const Bluebird: BluebirdConstructor;
  export = Bluebird;
  export default Bluebird;
}

declare module 'partial.lenses' {
  export function collect<T>(lens: unknown, data: unknown): T[];
  export function satisfying<T>(predicate: (value: unknown) => boolean): unknown;
}