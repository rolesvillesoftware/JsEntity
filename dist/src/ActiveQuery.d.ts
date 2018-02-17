import { IActiveQuery } from "./IBaseQuery";
import { Entity } from "./Entity";
import { Context } from "./Context";
import { Collection } from "./Collection";
import { Observable } from "rxjs";
export declare class ActiveQuery<T> implements IActiveQuery<T> {
    private pojso;
    private entity;
    private context;
    private sqlGen;
    private bindIndex;
    readonly sql: string;
    constructor(pojso: new () => T, entity: Entity<T>, context: Context);
    select(fields?: string | string[]): IActiveQuery<T>;
    where<B>(clause: (item: T, binds: B) => boolean, bindObj?: B): IActiveQuery<T>;
    execute(): Observable<Collection<T>>;
}
