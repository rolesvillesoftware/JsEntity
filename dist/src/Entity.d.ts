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
    fieldType: "string" | "number" | "date";
    bindValue(value: Date | number | string): Date | number | string;
    sql: string;
}
export interface INavigation {
    propertyName: string;
    parentTable: string;
    fkField: string | string[];
}
export declare class FieldMap implements IFieldMap {
    propertyName: string;
    fieldName: string;
    primaryKey: boolean;
    identity: boolean;
    fieldType: "string" | "number" | "date";
    readonly sql: string;
    bindValue(value: Date | number | string): Date | number | string;
}
export declare class NavigationMap implements INavigation {
    propertyName: string;
    parentTable: string;
    fkField: string | string[];
}
export declare class Entity<T, CTX extends Context<CTX>> implements IEntity {
    private parentContext;
    entityName: string;
    pojso: new () => T;
    private _fieldMap;
    private _fields;
    private _navigations;
    private _navigationMap;
    readonly fields: IFieldMap[];
    readonly navigations: INavigation[];
    tableName: string;
    schema: string;
    readonly qualifiedTable: string;
    constructor(parentContext: Context<CTX>, entityName: string, pojso: new () => T, tableName?: string, schema?: string);
    private validateMap(element, map);
    private validateFieldMap(element, map);
    private validateChildNavigationMap(element, map);
    map(maps: {}): Entity<T, CTX>;
    defineKey<R>(keys: string | string[]): Entity<T, CTX>;
    private buildInsertBind(pojso);
    insert<T>(pojso: T): Promise<T>;
    update<T>(pojso: T): Promise<T>;
}
