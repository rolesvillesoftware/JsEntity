import { FunctionParser } from "./FunctionParser";
import { Entity } from "./Entity";
import { primativeTypes, IBoundWhere } from "./SqlGenerator";
import { Context } from "./Context";

export class WhereParser<T, R, CTX extends Context<CTX>> implements IBoundWhere  {

    private parser: FunctionParser<T, R>;
    private _sql: string;
    private _binds: primativeTypes[];

    get statement(): string {
        return this._sql;
    }

    get binds(): primativeTypes[] {
        return this._binds;
    }
    constructor(private func: (item: T, bind: R) => boolean, private bind: R, private entity: Entity<T, CTX>) {
        this.parser = new FunctionParser(func).parse();
        this.buildSql();
        this.buildBinds();
    }

    private buildSql() {
        var _sql = this.parser.sql;

        this.entity.fields.forEach(item => {
            _sql = _sql.replace(new RegExp(`\:${item.propertyName}\:`, "g"), item.fieldName);
        });

        this._sql = _sql;
    }

    private buildBinds() {
        let re = /@\w+@/;

        let _sql = "";
        let _workSql = this._sql;
        let _binds = new Array<primativeTypes>(0);

        while (true) {
            let match = re.exec(_workSql)
            if (match == null || match.length === 0) { break; }

            _sql += `${_workSql.substr(0, match.index)}?`;
            _workSql = _workSql.substr(match.index + match[0].length);
            const bindVar = match[0].replace(/@/g, "").trim();
            _binds.push(this.bind[bindVar]);
        }
        _sql += _workSql;
        this._binds = _binds;
        this._sql = _sql.trim();
    }
}

