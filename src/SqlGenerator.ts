import { Collection } from "./Collection";
import { IFieldMap } from "./Entity";
import { WhereParser } from "./WhereParser";

export type sqlType = "select" | "update" | "insert" | "delete";

export type primativeTypes = string | number | Date;
export interface IBoundField {
  field: IFieldMap;
  value: primativeTypes;
}
export interface IBoundWhere {
  statement: string;
  binds: primativeTypes[];
}
export class SqlGenerator {
  private _fields = new Collection<IBoundField>();
  private _tables = new Collection<string>();
  private _filters = new Collection<IBoundWhere>();

  private _binds = new Collection<primativeTypes | {}>();

  constructor(private sqlType: sqlType) {}
  get sql(): string {
    switch (this.sqlType) {
      case "select":
        return this.selectSql();
      case "insert":
        return this.insertSql();
      case "update":
        return this.updateSql();
    }
  }
  get sqlObj(): any {
    const sqlObject = {
      sql: this.sql,
      timeout: 15000
    } as any;

    if (this._binds != null && this._binds.count > 0) {
      if (this._binds.count === 1) {
        sqlObject.values = this._binds.get(0);
      } else {
        sqlObject.values = this._binds.toArray();
      }
    }
    return sqlObject;
  }
  private selectSql(): string {
    if (this.sqlType == null || this._fields == null || this._fields.count === 0 || this._tables == null || this._tables.count === 0) {
      return "";
    }

    const sql = new Array<string>(0);
    sql.push(`${this.sqlType.toUpperCase()}`);
    sql.push(
      `\t${this._fields
        .toArray()
        .map(item => item.field.sql)
        .join(",\n\t")}`
    );
    sql.push(`FROM`);
    sql.push(`\t${this._tables.toArray().join("\n\t")}`);

    if (this._filters != null && this._filters.count > 0) {
      const whereClause = new Array<string>(0);
      whereClause.push(`WHERE`);
      let first = true;
      this._filters.forEach(filter => {
        whereClause.push("\n\t");
        if (first) {
          first = false;
        } else {
          whereClause.push("AND\t");
        }

        whereClause.push(`( ${filter.statement} )`);
        if (filter.binds != null && filter.binds.length > 0) {
          this._binds.addRange(filter.binds);
        }
      });
      sql.push(whereClause.join(""));
    }
    return sql.join("\n");
  }
  private insertSql(): string {
    if (this._tables == null) {
      if (this._tables.count === 0) {
        throw new Error("No table definition found for insert");
      }
      if (this._tables.count > 1) {
        throw new Error("Currently only one table can be defined for an insert");
      }
    }
    return `insert into ${this._tables.get(0)} set ?`;
  }
  private updateSql(): string {
    this._binds.clear();

    const sql = new Array<string>(0);
    sql.push(`${this.sqlType} ${this._tables.get(0)} set`);
    sql.push(
      this._fields
        .toArray()
        .map(field => `\t${field.field.fieldName}=?`)
        .join(",\n")
    );
    this._fields.toArray().forEach(field => {
      this.addBind(field.value);
    });
    sql.push("where");
    sql.push(
      this._filters
        .toArray()
        .map(filter => `\t${filter.statement}`)
        .join("\nAND ")
    );
    this._filters.toArray().forEach(filter => {
      filter.binds.forEach(bind => {
        this.addBind(bind);
      });
    });

    return sql.join("\n");
  }
  clearFields(): SqlGenerator {
    this._fields.clear();
    return this;
  }
  addField(field: IFieldMap, value?: string | number | Date): SqlGenerator {
    this._fields.add({
      field: field,
      value: value
    });
    return this;
  }
  addFrom(from: string): SqlGenerator {
    this._tables.add(from);
    return this;
  }
  addWhere<T, R>(where: IBoundWhere): SqlGenerator {
    this._filters.add(where);
    return this;
  }
  addBind(bindobj: {}): SqlGenerator {
    this._binds.add(bindobj);
    return this;
  }
  setForUpdate<T>(tableName: string, pojso: T, fieldMap: IFieldMap[]): SqlGenerator {
    this._fields.clear();
    this._binds.clear();
    this._tables.clear();

    this.addFrom(tableName);
    /** Set the non-primary key values */
    fieldMap.filter(field => !field.primaryKey).forEach(field => {
      this.addField(field, pojso[field.propertyName]);
    });

    /** Set the primary keys */
    const binds = new Array<primativeTypes>(0);
    let sql = new Array<string>(0);

    fieldMap.filter(field => field.primaryKey).forEach(field => {
      sql.push(`${field.fieldName} = ?`);

      let bindValue: number | string | Date = pojso[field.propertyName];
      binds.push(field.bindValue(pojso[field.propertyName]));
    });
    this.addWhere({
      statement: sql.join(" AND "),
      binds: binds
    });
    return this;
  }
}
