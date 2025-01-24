// TODO: improve types and update the callers to use the new types properly

type SafeKeyOf<T> = (keyof T) extends string ? (keyof T) extends never ? string : (keyof T) : any;

export function objectKeys<T>(object: T): SafeKeyOf<T>[] {
    if (!object) { return []; }
    return Object.keys(object) as SafeKeyOf<T>[];
}

export function objectValues<T = any>(object?: Record<string, T>): T[] {
    if (!object) { return []; }
    return Object.keys(object).map(key => object[key]);
}

export function objectKVs<T>(object: T): {
    key: keyof T extends never ? string : keyof T;
    value: keyof T extends never ? any : T[keyof T];
}[] {
    return objectKeys(object).map((key: any) => {
        return { key, value: object[key] };
    });
}

/* // Examples
const xx = {};
const kx = objectKeys(xx); // string[]
const vx = objectValues(xx); // any[]
const kvx = objectKVs(xx); // { key: string; value: any; }[]

const hi = { hello: 'world', count: 0 };
const kh = objectKeys(hi); // ("hello" | "count")[]
const vh = objectValues(hi); // (string | number)[]
const kvh = objectKVs(hi); // { key: "hello" | "count"; value: string | number; }[]
*/