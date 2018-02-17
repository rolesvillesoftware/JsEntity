import { Entity } from "./Entity";
export declare type EntityStates = "unmodified" | "add" | "modified" | "delete";
export declare class ChangeProxy<R> {
    private _state;
    private _isNew;
    private _entityObj;
    private _entity;
    readonly state: EntityStates;
    readonly obj: R;
    readonly entity: Entity<R>;
    readonly isDirty: boolean;
    constructor(entity: Entity<R>, entityObject: R, isNew: boolean);
    setDirty(): ChangeProxy<R>;
    setDelete(): ChangeProxy<R>;
    setCleaned(): ChangeProxy<R>;
    setSaved(): ChangeProxy<R>;
}
