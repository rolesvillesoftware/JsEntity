export interface IMapping {
    origField: string;
    newField: string;
    bindVariable: boolean;
}
export declare class FunctionParser<T, R> {
    private func;
    private _identifiers;
    private _fields;
    private _sql;
    readonly fieldIdentifier: string;
    readonly bindIdentifier: string;
    readonly sql: string;
    private readonly function$;
    constructor(func: (item: T, bind: R) => boolean);
    parse(): FunctionParser<T, R>;
    private getFields();
    private substituteVariables(variables, sql, identifier);
    private parseSql();
    private parseIdentifier();
    private substituteOperands(clause);
}
