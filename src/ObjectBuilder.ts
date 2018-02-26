import { IFieldMap, Entity } from "./Entity";
import { ChangeProxy } from "./ChangeProxy";
import { Context } from "./Context";

export class ObjectBuilder {
    static createObject<R, CTX extends Context<CTX>>(pojso: new () => R, queryResults: {}, entity: Entity<R, CTX>, create?: boolean): ChangeProxy<R, CTX> {
        const returnObj = new pojso();
        return ObjectBuilder.proxyObject(returnObj, queryResults, entity, create);
    }

    static proxyObject<R, CTX extends Context<CTX>>(dest: R, source: {}, entity: Entity<R, CTX>, create?: boolean): ChangeProxy<R, CTX> {
        const proxy = new ChangeProxy<R, CTX>(entity, dest, create);
        dest["proxy"] = proxy;

        entity.fields.forEach(field => {
            ObjectBuilder.buildKey(dest, source, field, create);
        });
        return proxy;
    }
    static rebuildKeys<R, CTX extends Context<CTX>>(dest: R, entity: Entity<R, CTX>) {
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
        const hostField = ObjectBuilder.setKeyFlags(dest, source, field.propertyName, field, create);
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
    static setKeyFlags<R>(dest: R, source: {}, key: string, field: IFieldMap, create?: boolean): string {
        if (!ObjectBuilder.isProxy(dest)) { return; }

        const hostField = ObjectBuilder.getHostField(key);
        dest[hostField] = create && field.identity ? null : source[key];

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
