export declare class Collection<T> {
    private _collection;
    readonly count: number;
    add(obj: T): T;
    addRange(objs: T[]): Collection<T>;
    clear(): Collection<T>;
    remove(obj: T): boolean;
    filter(filter: (item: T, index?: number) => any): T[];
    forEach(func: (item: T) => void): void;
    toArray(): T[];
    get(position?: number): T;
}
