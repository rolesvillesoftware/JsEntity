import { DbSet } from "./DbSet";
import { FunctionParser } from "./FunctionParser";
import { SqlGenerator } from "./SqlGenerator";
import { Context } from "./Context";
import { ObjectBuilder } from "./ObjectBuilder";
import { SafePromise, Exception } from "@rolesvillesoftware/tools/dist";

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
              throw new Exception(`Invalid value for bind field ${this.fieldName}`);
            } else {
              bindValue = new Date(bindValue);
            }
          }
          return bindValue;
      }
}
export class NavigationMap implements INavigation {
    propertyName: string;
    parentTable: string;
    fkField: string | string[];
}
/**
 * Entity model
 */
export class Entity<T, CTX extends Context<CTX>> implements IEntity {

    private _fieldMap: {} = {};
    private _fields: IFieldMap[] = new Array<IFieldMap>(0);
    private _navigations: INavigation[] = new Array<INavigation>(0);
    private _navigationMap: {} = {};

    get fields(): IFieldMap[] {
        return this._fields;
    }
    get navigations(): INavigation[] {
        return this._navigations;
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
        if (map == null) { throw new Exception("No map definition defined"); }
        if (map["childTable"] == null) { return this.validateFieldMap(element, map); }
        if (map["childTable"] != null) { return this.validateChildNavigationMap(element, map);  }

        throw new Exception("Unable to determine mapping pattern");
    }
    private validateFieldMap(element: string, map: any): {} {
        if (map.fieldName == null) { map.fieldName = map.propertyName; }
        if (map.propertyName == null) { map.propertyName = element; }
        if (map.primaryKey == null) { map.primaryKey = false; }
        if (map.identify == null) { map.identify = false; }

        if (map.propertyName !== element) { throw new Exception('Property name and Object field do not match. ${element}')}

        map.isNavigation = false;
        return map;
    }
    private validateChildNavigationMap(element: string, map: any): {} {
        if (map.propertyName == null) { map.propertyName = element; }
        if (map.fkField == null) { throw new Exception('Parent Table and Foreign Key field are required fields'); }

        map.isNavigation = true;
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
            let map: string | IFieldMap | INavigation = maps[element];
            if (map != null) {
                if (typeof (map) === "string") {
                    map = {
                        propertyName: element,
                        fieldName: map
                    } as IFieldMap;
                }
                this.validateMap(element, map);
                if (map["isNavigation"]) {
                    this._navigationMap[element] = map;
                    this._navigations.push(Object.assign(new NavigationMap(), map));
                } else {
                    this._fieldMap[element] = map;
                    this._fields.push(Object.assign(new FieldMap(), map));
                }
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
                    throw new Exception(`Field ${key} not defined in entity`);
                } else if (field.length > 1) {
                    throw new Exception('Multiple definitions for field ${key} found in entity');
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
        if (results.isError) { throw new Exception(results.error); }
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
        if (result.isError) { throw new Exception(result.error); }

        pojso["proxy"].setSaved();
        return pojso;
    }
}
