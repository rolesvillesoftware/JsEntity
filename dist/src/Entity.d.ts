import { Context } from "./Context";
export interface IEntity {
    entityName: string;
    tableName: string;
    schema: string;
}
export interface IFieldMap {
    propertyName: string;
    fieldName: string;
    primaryKey: boolean;
    identity: boolean;
    sql: string;
}
export declare class FieldMap implements IFieldMap {
    propertyName: string;
    fieldName: string;
    primaryKey: boolean;
    identity: boolean;
    readonly sql: string;
}
export declare class Entity<T> implements IEntity {
    private parentContext;
    entityName: string;
    pojso: new () => T;
    private _fieldMap;
    private _fields;
    readonly fields: IFieldMap[];
    tableName: string;
    schema: string;
    readonly qualifiedTable: string;
    constructor(parentContext: Context, entityName: string, pojso: new () => T, tableName?: string, schema?: string);
    private validateMap(map);
    map(maps: {}): Entity<T>;
    defineKey<R>(keys: string | string[]): Entity<T>;
    private buildInsertBind(pojso);
    insert<T>(pojso: T): Promise<T>;
    update<T>(pojso: T): Promise<T>;
}
