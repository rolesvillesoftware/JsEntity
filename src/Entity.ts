import { DbSet } from "./DbSet";
import { FunctionParser } from "./FunctionParser";
import { SqlGenerator } from "./SqlGenerator";
import { Context } from "./Context";
import { ObjectBuilder } from "./ObjectBuilder";
import { SafePromise } from "@rolesvillesoftware/tools/dist";

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

export class FieldMap implements IFieldMap {
    propertyName: string;
    fieldName: string;
    primaryKey: boolean;
    identity: boolean;
    fieldType: "string" | "number" | "date";

    get sql(): string {
        return `${this.fieldName} as ${this.propertyName}`;
    }
    bindValue(value: Date | number | string): Date | number | string {
        let bindValue = value;
        if (this.fieldType === "date" && !(bindValue instanceof Date)) {
            if (typeof bindValue !== "string") {
              throw new Error(`Invalid value for bind field ${this.fieldName}`);
            } else {
              bindValue = new Date(bindValue);
            }
          }
          return bindValue;
      }
}
/**
 * Entity model
 */
export class Entity<T, CTX extends Context<CTX>> implements IEntity {

    private _fieldMap: {} = {};
    private _fields: IFieldMap[] = new Array<IFieldMap>(0);

    get fields(): IFieldMap[] {
        return this._fields;
    }

    public tableName: string;
    public schema: string;

    get qualifiedTable(): string {
        const tableName = [];
        if (this.schema != null && this.schema.length > 0) { tableName.push(this.schema); }
        tableName.push(this.tableName)
        return tableName.join(".");
    }
    constructor(private parentContext: Context<CTX>, public entityName: string, public pojso: new () => T, tableName?: string, schema?: string) {
        this.tableName = tableName || entityName;
        this.schema = schema;

        this.parentContext[entityName] = new DbSet(pojso, this, this.parentContext);
    }

    private validateMap(element: string, map: any): {} {
        if (map.fieldName == null) { map.fieldName = map.propertyName; }
        if (map.propertyName == null) { map.propertyName = element; }
        if (map.primaryKey == null) { map.primaryKey = false; }
        if (map.identify == null) { map.identify = false; }

        if (map.propertyName !== element) { throw new Error('Property name and Object field do not match. ${element}')}
        return map;
    }
    /**
     * Create the mapping of the fields to POJSO
     * @param maps Object containing the map definition
     */
    map(maps: {}): Entity<T, CTX> {
        this._fieldMap = Object.assign(this._fieldMap, maps);
        this._fields = new Array<IFieldMap>(0);

        Object.keys(this._fieldMap).forEach(element => {
            let map: string | IFieldMap = maps[element];
            if (map != null) {
                if (typeof (map) === "string") {
                    map = {
                        propertyName: element,
                        fieldName: map
                    } as IFieldMap;
                }
                this.validateMap(element, map);
                this._fieldMap[element] = map;
                this._fields.push(Object.assign(new FieldMap(), map));
            }
        });
        return this;
    }

    /**
     * Identify the key field(s) for the object.
     *
     * @param keys {string | string[]} The field or fields to identify the primary key
     */
    defineKey<R>(keys: string | string[]): Entity<T, CTX> {
        this.fields.filter(item => item.primaryKey).forEach(item => item.primaryKey = false);
        let workKeys = new Array<string>(0);
        if (typeof (keys) === "string") {
            workKeys.push(keys);
        } else {
            workKeys = keys;
        }

        if (workKeys != null && workKeys.length > 0) {
            workKeys.forEach(key => {
                const field = this.fields.filter(item => item.propertyName === key);
                if (field.length === 0) {
                    throw new Error(`Field ${key} not defined in entity`);
                } else if (field.length > 1) {
                    throw new Error('Multiple definitions for field ${key} found in entity');
                } else {
                    field.forEach(field => field.primaryKey = true);
                }
            });
        }
        return this;
    }

    /**
     * Used to dynamically build the insert bind object
     */
    private buildInsertBind(pojso: any): {} {
        const bindObj = {};
        this._fields.forEach(field => {
            if (pojso[field.propertyName] != null) {
                bindObj[field.fieldName] = field.bindValue(pojso[field.propertyName]);
            }
        });
        return bindObj;
    }

    async insert<T>(pojso: T): Promise<T> {
        let sql = new SqlGenerator("insert");
        sql.addFrom(this.qualifiedTable)
            .addBind(this.buildInsertBind(pojso));
        const results = await SafePromise.run(() => this.parentContext.Database.runQuery(sql));
        if (results.isError) { throw new Error(results.error); }
        const result = results.value;

        if (result != null && result.results.insertId != null) {
            const identityField = this.fields.find(item => item.identity);
            if (identityField != null) {
                const hostField = ObjectBuilder.getHostField(identityField.propertyName);
                pojso[hostField] = result.results.insertId;
            }
            pojso["proxy"].setSaved();
        }

        return pojso;
    }

    async update<T>(pojso: T): Promise<T> {
        let sql = new SqlGenerator("update");
        sql.setForUpdate(this.qualifiedTable, pojso, this.fields);
        const result = await SafePromise.run(() => this.parentContext.Database.runQuery(sql));
        if (result.isError) { throw new Error(result.error); }

        pojso["proxy"].setSaved();
        return pojso;
    }
}
