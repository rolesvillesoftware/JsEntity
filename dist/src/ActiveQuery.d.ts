import { IActiveQuery } from "./IBaseQuery";
import { Entity } from "./Entity";
import { Context } from "./Context";
import { Collection } from "./Collection";
import { Observable } from "rxjs";
export declare class ActiveQuery<T, CTX extends Context<CTX>> implements IActiveQuery<T> {
    private pojso;
    private entity;
    private context;
    private sqlGen;
    private bindIndex;
    readonly sql: string;
    constructor(pojso: new () => T, entity: Entity<T, CTX>, context: Context<CTX>);
    select(fields?: string | string[]): IActiveQuery<T>;
    where<B>(clause: (item: T, binds: B) => boolean, bindObj?: B): IActiveQuery<T>;
    execute(): Observable<Collection<T>>;
}
