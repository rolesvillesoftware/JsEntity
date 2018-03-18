import { IFieldMap, Entity, INavigation } from "./Entity";
import { ChangeProxy } from "./ChangeProxy";
import { Context } from "./Context";
export declare class ObjectBuilder {
    static createObject<R, CTX extends Context<CTX>>(pojso: new () => R, queryResults: {}, entity: Entity<R, CTX>, create?: boolean): ChangeProxy<R, CTX>;
    static proxyObject<R, CTX extends Context<CTX>>(dest: R, source: {}, entity: Entity<R, CTX>, create?: boolean): ChangeProxy<R, CTX>;
    static rebuildKeys<R, CTX extends Context<CTX>>(dest: R, entity: Entity<R, CTX>): void;
    static isProxy<R>(dest: R): boolean;
    static buildKey<R>(dest: R, source: {}, field: IFieldMap, create?: boolean): void;
    static defineKeyProperties<R>(dest: R, hostField: string, field: IFieldMap, create: boolean): void;
    static setKeyFlags<R>(dest: R, source: {}, key: string, field: IFieldMap, create?: boolean): string;
    static getHostField(key: string): string;
    static buildGet(hostField: string): string;
    static buildSet(hostField: string, isKey: boolean): string;
    static buildNavigation<R>(dest: R, field: INavigation): void;
    static buildNavigationGet(): string;
    static buildNavigationSet(): string;
}
