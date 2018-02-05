import { DbSet } from "./DbSet";
import { FunctionParser } from "./FunctionParser";

export interface IEntity {
    entityName: string;
    tableName: string;
    schema: string;
}

export interface IFieldMap {
    propertyName: string;
    fieldName: string;
    primaryKey: boolean;
    sql: string;
}

export class FieldMap implements IFieldMap {
    propertyName: string;
    fieldName: string;
    primaryKey: boolean;

    get sql(): string {
        return `${this.fieldName} as ${this.propertyName}`;
    }
}
/**
 * Entity model
 */
export class Entity<T> implements IEntity {

    private _fieldMap: {} = {};
    private _fields: IFieldMap[] = new Array<IFieldMap>(0);

    get fields(): IFieldMap[] {
        return this._fields;
    }

    public tableName: string;
    public schema: string;

    constructor(private parentContext, public entityName: string, public pojso: new () => T, tableName?: string, schema?: string) {
        this.tableName = tableName || entityName;
        this.schema = schema;

        this.parentContext[entityName] = new DbSet(pojso, this, this.parentContext);
    }

    /**
     * Create the mapping of the fields to POJSO
     * @param maps Object containing the map definition
     */
    map(maps: {}): Entity<T> {
        this._fieldMap = Object.assign(this._fieldMap, maps);
        this._fields = new Array<IFieldMap>(0);

        Object.keys(this._fieldMap).forEach(element => {
            let map: string | IFieldMap = maps[element];
            if (map != null) {
                if (typeof (map) === "string") {
                    let field: IFieldMap = Object.assign(new FieldMap(), {
                        propertyName: element,
                        fieldName: map,
                        primaryKey: false
                    });
                    this._fieldMap[element] = field;
                    this._fields.push(field);
                } else {
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
    defineKey<R>(keys: string | string[]): Entity<T> {
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
}
