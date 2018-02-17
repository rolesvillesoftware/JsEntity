import { Context } from "./Context";
import { Entity, IEntity } from "./Entity";
export declare class ContextModel<CTX extends Context<CTX>> {
    private parentContext;
    private _entities;
    readonly entities: {};
    constructor(parentContext: Context<CTX>);
    add<T>(entityName: string, pojso: new () => T, tableName?: string, schema?: string): Entity<T, CTX>;
    listEntities(): IEntity[];
}
