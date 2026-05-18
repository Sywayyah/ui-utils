export type PropertyTypeMapping<T extends Record<string, object>> = {
  readonly [K in keyof T]: { readonly type: K } & Readonly<T[K]>;
}[keyof T];

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
