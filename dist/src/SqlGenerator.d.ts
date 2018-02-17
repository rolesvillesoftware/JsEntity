import { IFieldMap } from "./Entity";
export declare type sqlType = "select" | "update" | "insert" | "delete";
export declare type primativeTypes = string | number | Date;
export interface IBoundField {
    field: IFieldMap;
    value: primativeTypes;
}
export interface IBoundWhere {
    statement: string;
    binds: primativeTypes[];
}
export declare class SqlGenerator {
    private sqlType;
    private _fields;
    private _tables;
    private _filters;
    private _binds;
    constructor(sqlType: sqlType);
    readonly sql: string;
    readonly sqlObj: any;
    private selectSql();
    private insertSql();
    private updateSql();
    clearFields(): SqlGenerator;
    addField(field: IFieldMap, value?: string | number | Date): SqlGenerator;
    addFrom(from: string): SqlGenerator;
    addWhere<T, R>(where: IBoundWhere): SqlGenerator;
    addBind(bindobj: {}): SqlGenerator;
    setForUpdate<T>(tableName: string, pojso: T, fieldMap: IFieldMap[]): SqlGenerator;
}
