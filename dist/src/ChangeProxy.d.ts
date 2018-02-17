import { Entity } from "./Entity";
import { Context } from "./Context";
export declare type EntityStates = "unmodified" | "add" | "modified" | "delete";
export declare class ChangeProxy<R, CTX extends Context<CTX>> {
    private _state;
    private _isNew;
    private _entityObj;
    private _entity;
    readonly state: EntityStates;
    readonly obj: R;
    readonly entity: Entity<R, CTX>;
    readonly isDirty: boolean;
    constructor(entity: Entity<R, CTX>, entityObject: R, isNew: boolean);
    setDirty(): ChangeProxy<R, CTX>;
    setDelete(): ChangeProxy<R, CTX>;
    setCleaned(): ChangeProxy<R, CTX>;
    setSaved(): ChangeProxy<R, CTX>;
}
