import { IAttachedObject } from "./Context";
import { IFieldMap, Entity } from "./Entity";

export enum entityFlags {
    isDirty = "_$$isDirty$$",
    isProxy = "_$$proxy$$",
    isUpdate = "_$$update$$",
    orig = "_$$orig$$",
    entity = "_$$entity$$"
};

export class ObjectBuilder {
    static createObject<R>(pojso: new () => R, queryResults: {}, entity: Entity<R>, create?: boolean): R {
        const returnObj = new pojso();
        return ObjectBuilder.proxyObject(returnObj, queryResults, entity, create);
    }

    static proxyObject<R>(dest: R, source: {}, entity: Entity<R>, create?: boolean): R {
        dest[entityFlags.isDirty] = false;
        dest[entityFlags.isProxy] = true;
        dest[entityFlags.isUpdate] = !create;
        dest[entityFlags.orig] = {};
        dest[entityFlags.entity] = entity;

        Object.keys(source).forEach(key => {
            const field = entity.fields.find(item => item.propertyName === key);
            if (field == null) { return; }
            ObjectBuilder.buildKey(dest, source, key, field, create);
        });
        return dest;
    }
    static buildKey<R>(dest: R, source: {}, key: string, field: IFieldMap, create?: boolean) {
        const hostField = ObjectBuilder.setKeyFlags(dest, source, key);

        const defineString = `Object.defineProperty(dest, key, {
            ${ObjectBuilder.buildGet(hostField)},
            ${ObjectBuilder.buildSet(hostField, !create && field.primaryKey)},
            configurable: true
        })`;
        eval(defineString);
    }
    static setKeyFlags<R>(dest: R, source: {}, key: string): string {
        if (!dest[entityFlags.isProxy]) { return; }

        const hostField = `_${"$"}${key}$_`;
        dest[hostField] = source[key];
        dest[entityFlags.orig][hostField] = source[key];

        return hostField;
    }
    static buildGet(hostField: string): string {
        return `get() { return this.${hostField}; }`;
    }
    static buildSet(hostField: string, isKey: boolean) {
        if (isKey) {
            return `set(value) { throw new Error("Unable to update key field. Please create/clone a new record.");  }`;
        } else {
            return `set(value) { if (this.${hostField} !== value) { this.${hostField} = value; this.${entityFlags.isDirty} = true; } }`;
        }
    }
    static resetEntity<R>(pojso: R, rebuildProperties?: boolean): R {
        const entity = pojso[entityFlags.entity] as Entity<R>;
        if (entity == null) { return; }

        entity.fields.forEach(field => {
            ObjectBuilder.buildKey(pojso, pojso, field.propertyName, field, false);
        });

        pojso[entityFlags.isUpdate] = true;
        pojso[entityFlags.isDirty] = false;
        return pojso;
    }
}
