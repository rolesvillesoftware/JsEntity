export declare class Collection<T> {
    private _collection;
    readonly count: number;
    readonly isSingle: boolean;
    readonly isEmpty: boolean;
    readonly hasElements: boolean;
    add(obj: T): T;
    addRange(objs: T[]): Collection<T>;
    clear(): Collection<T>;
    remove(obj: T): boolean;
    filter(filter: (item: T, index?: number) => any): T[];
    forEach(func: (item: T) => void): void;
    toArray(): T[];
    get(position?: number): T;
    firstOrNull(): T;
    first(): T;
    singleOrNull(): T;
    single(): T;
}
