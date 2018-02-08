import { Collection } from "./Collection";
import { IFieldMap } from "./Entity";

export type sqlType = "select" | "update" | "insert" | "delete";

export class SqlGenerator {

    private _fields = new Collection<IFieldMap>();
    private _tables = new Collection<string>();
    private _filters = new Collection<string>();

    private _binds = new Collection<string | number | {}>();

    constructor(private sqlType: sqlType) {}
    get sql(): string {
        switch (this.sqlType) {
            case "select":
                return this.selectSql();
            case "insert":
                return this.insertSql();
        }
    }

    get sqlObj(): any {
        const sqlObject= {
            sql: this.sql,
            timeout: 15000,
        } as any;

        if (this._binds !=  null && this._binds.count > 0) {
            if (this._binds.count === 1) {
                sqlObject.values = this._binds.toArray()[0];
            } else {
                sqlObject.values = this._binds;
            }
        }
        return sqlObject;
    }

    private selectSql(): string {
        if (this.sqlType == null || this._fields == null || this._fields.count === 0 ||
            this._tables == null || this._tables.count === 0) { return ""; }

        const sql = new Array<string>(0);
        sql.push(`${this.sqlType}`);
        sql.push(`\t${this._fields.toArray().map(item => item.sql).join(",\r\n\t")}`);
        sql.push(`from`);
        sql.push(`\t${this._tables.toArray().join("\r\n\t")}`);

        if (this._filters != null && this._filters.count > 0) {
            const whereClause = new Array<string>(0);
            whereClause.push(`where\r\n`);
            whereClause.push(`\t(${this._filters.toArray().join(")\r\nAND\t(")}`)
            whereClause.push(")");
            sql.push(whereClause.join(''));
        }
        return sql.join("\r\n");
    }
    private insertSql(): string {
        if (this._tables == null) {
            if (this._tables.count === 0) { throw new Error("No table definition found for insert"); }
            if (this._tables.count > 1) { throw new Error("Currently only one table can be defined for an insert"); }
        }
        return `insert into ${this._tables.toArray()[0]} set ?`
    }
    clearFields(): SqlGenerator {
        this._fields.clear();
        return this;
    }
    addField(field: IFieldMap): SqlGenerator {
        this._fields.add(field);
        return this;
    }
    addFrom(from: string): SqlGenerator {
        this._tables.add(from);
        return this;
    }
    addWhere(clause: string): SqlGenerator {
        this._filters.add(clause);
        return this;
    }
    addBind(bindobj: {}): SqlGenerator {
        this._binds.add(bindobj);
        return this;
    }

}
