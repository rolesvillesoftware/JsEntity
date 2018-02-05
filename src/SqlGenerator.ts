import { Collection } from "./Collection";
import { IFieldMap } from "./Entity";

export type sqlType = "select" | "update" | "insert" | "delete";

export class SqlGenerator {

    private _fields = new Collection<IFieldMap>();
    private _tables = new Collection<string>();
    private _filters = new Collection<string>();

    private _binds = new Collection<string | number>();

    constructor(private sqlType: sqlType) {}
    get sql(): string {
        if (this.sqlType === "select") { return this.selectSql(); }

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

    clearFields(): SqlGenerator {
        this._fields.clear();
        return this;
    }
    addField(field: IFieldMap): SqlGenerator {
        this._fields.add(field);
        return this;
    }
    addFrom(from: string) {
        this._tables.add(from);
    }
    addWhere(clause: string) {
        this._filters.add(clause);
    }

}
