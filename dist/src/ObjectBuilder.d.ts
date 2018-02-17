import { IFieldMap, Entity } from "./Entity";
import { ChangeProxy } from "./ChangeProxy";
export declare class ObjectBuilder {
    static createObject<R>(pojso: new () => R, queryResults: {}, entity: Entity<R>, create?: boolean): ChangeProxy<R>;
    static proxyObject<R>(dest: R, source: {}, entity: Entity<R>, create?: boolean): ChangeProxy<R>;
    static rebuildKeys<R>(dest: R, entity: Entity<R>): void;
    static isProxy<R>(dest: R): boolean;
    static buildKey<R>(dest: R, source: {}, field: IFieldMap, create?: boolean): void;
    static defineKeyProperties<R>(dest: R, hostField: string, field: IFieldMap, create: boolean): void;
    static setKeyFlags<R>(dest: R, source: {}, key: string): string;
    static getHostField(key: string): string;
    static buildGet(hostField: string): string;
    static buildSet(hostField: string, isKey: boolean): string;
}
