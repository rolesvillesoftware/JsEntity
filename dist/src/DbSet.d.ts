import { Entity } from "./Entity";
import { IBaseQuery, IActiveQuery } from "./IBaseQuery";
import { Context } from "./Context";
import { Collection } from "./Collection";
export declare class DbSet<T, CTX extends Context<CTX>> implements IBaseQuery<T> {
    private pojso;
    entity: Entity<T, CTX>;
    private context;
    constructor(pojso: new () => T, entity: Entity<T, CTX>, context: Context<CTX>);
    select(fields?: string | string[]): IActiveQuery<T>;
    where<B>(clause: (item: T, binds: B) => boolean, bindObj?: B): IActiveQuery<T>;
    create<B>(bindObj?: B): T;
    selectOrCreate(clause: (item: T, binds: T) => boolean, bindObj?: T): Promise<Collection<T>>;
}
