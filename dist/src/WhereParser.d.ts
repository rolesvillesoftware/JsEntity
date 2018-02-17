import { Entity } from "./Entity";
import { primativeTypes, IBoundWhere } from "./SqlGenerator";
import { Context } from "./Context";
export declare class WhereParser<T, R, CTX extends Context<CTX>> implements IBoundWhere {
    private func;
    private bind;
    private entity;
    private parser;
    private _sql;
    private _binds;
    readonly statement: string;
    readonly binds: primativeTypes[];
    constructor(func: (item: T, bind: R) => boolean, bind: R, entity: Entity<T, CTX>);
    private buildSql();
    private buildBinds();
}
