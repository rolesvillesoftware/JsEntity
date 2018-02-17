import { Context } from "./Context";
import { Entity, IEntity } from "./Entity";
export declare class ContextModel {
    private parentContext;
    private _entities;
    readonly entities: {};
    constructor(parentContext: Context);
    add<T>(entityName: string, pojso: new () => T, tableName?: string, schema?: string): Entity<T>;
    listEntities(): IEntity[];
}
