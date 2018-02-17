import { Entity } from "./Entity";
import { IBaseQuery, IActiveQuery } from "./IBaseQuery";
import { Context } from "./Context";
export declare class DbSet<T> implements IBaseQuery<T> {
    private pojso;
    entity: Entity<T>;
    private context;
    constructor(pojso: new () => T, entity: Entity<T>, context: Context);
    select(fields?: string | string[]): IActiveQuery<T>;
    where<B>(clause: (item: T, binds: B) => boolean, bindObj?: B): IActiveQuery<T>;
    create(): T;
}
