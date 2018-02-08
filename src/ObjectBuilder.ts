import { IAttachedObject } from "./Context";
import { IFieldMap, Entity } from "./Entity";


export class ObjectBuilder {
    static createObject<R>(pojso: new () => R, queryResults: {}, entity: Entity<R>, create?: boolean): R {
        const returnObj = new pojso();
        return ObjectBuilder.proxyObject(returnObj, queryResults, entity, create);
    }

    static proxyObject<R>(dest: R, source: {}, entity: Entity<R>, create?: boolean): R {
        dest["_$$isDirty$$"] = false;
        dest["_$$proxy$$"] = true;
        dest["_$$update$$"] = !create;
        dest["_$$orig$$"] = {};
        dest["_$$entity$$"] = entity;

        Object.keys(source).forEach(key => {
            const field = entity.fields.find(item => item.propertyName === key);
            if (field == null) { return; }
            ObjectBuilder.buildKey(dest, source, key, field, create);
        });
        return dest;
    }
    static buildKey<R>(dest: R, source: {}, key: string, field: IFieldMap, create?: boolean) {
        const hostField = `_${"$"}${key}$_`;
        dest[hostField] = source[key];
        dest["_$$orig$$"][hostField] = source[key];

        const defineString = `Object.defineProperty(dest, key, {
            ${ObjectBuilder.buildGet(hostField)},
            ${ObjectBuilder.buildSet(hostField, !create && field.primaryKey)}
        })`;
        eval(defineString);
    }
    static buildGet(hostField: string): string {
        return `get() { return this.${hostField}; }`;
    }
    static buildSet(hostField: string, isKey: boolean) {
        if (isKey) {
            return `set(value) { throw new Error("Unable to update key field. Please create/clone a new record.");  }`;
        } else {
            return `set(value) { if (this.${hostField} !== value) { this.${hostField} = value; this._$$isDirty$$ = true; } }`;
        }

    }
}
