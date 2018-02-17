import { IFieldMap, Entity } from "./Entity";
import { ChangeProxy } from "./ChangeProxy";

export class ObjectBuilder {
    static createObject<R>(pojso: new () => R, queryResults: {}, entity: Entity<R>, create?: boolean): ChangeProxy<R> {
        const returnObj = new pojso();
        return ObjectBuilder.proxyObject(returnObj, queryResults, entity, create);
    }

    static proxyObject<R>(dest: R, source: {}, entity: Entity<R>, create?: boolean): ChangeProxy<R> {
        const proxy = new ChangeProxy<R>(entity, dest, create);
        dest["proxy"] = proxy;

        Object.keys(source).forEach(key => {
            const field = entity.fields.find(item => item.propertyName === key);
            if (field == null) { return; }
            ObjectBuilder.buildKey(dest, source, field, create);
        });
        return proxy;
    }
    static rebuildKeys<R>(dest: R, entity: Entity<R>) {
        const fields = entity.fields.filter(field => field.primaryKey);
        fields.forEach(field => {
            if (dest.hasOwnProperty(field.propertyName)) {
                ObjectBuilder.defineKeyProperties(dest, ObjectBuilder.getHostField(field.propertyName), field, false);
            }
        });
    }
    static isProxy<R>(dest: R): boolean {
        return dest["proxy"] != null && dest["proxy"] instanceof ChangeProxy;
    }
    static buildKey<R>(dest: R, source: {}, field: IFieldMap, create?: boolean) {
        const hostField = ObjectBuilder.setKeyFlags(dest, source, field.propertyName);
        ObjectBuilder.defineKeyProperties(dest, hostField, field, create);
    }
    static defineKeyProperties<R>(dest: R, hostField: string, field: IFieldMap, create: boolean) {

        const defineString = `Object.defineProperty(dest, field.propertyName, {
            ${ObjectBuilder.buildGet(hostField)},
            ${ObjectBuilder.buildSet(hostField, (!create && field.primaryKey) || (field.identity))},
            configurable: true
        })`;
        eval(defineString);
    }
    static setKeyFlags<R>(dest: R, source: {}, key: string): string {
        if (!ObjectBuilder.isProxy(dest)) { return; }

        const hostField = ObjectBuilder.getHostField(key);
        dest[hostField] = source[key];

        return hostField;
    }
    static getHostField(key: string) {
        return `_${"$"}${key}$_`;
    }
    static buildGet(hostField: string): string {
        return `get() { return this.${hostField}; }`;
    }
    static buildSet(hostField: string, isKey: boolean) {
        if (isKey) {
            return `set(value) { throw new Error("Unable to update key field. Please create/clone a new record.");  }`;
        } else {
            return `set(value) { if (this.${hostField} !== value) { this.${hostField} = value; this.proxy.setDirty(); } }`;
        }
    }
}
