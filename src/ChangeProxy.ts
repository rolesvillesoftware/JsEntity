import { Entity } from "./Entity";
import { ObjectBuilder } from "./ObjectBuilder";

export type EntityStates = "unmodified" | "add" | "modified" | "delete";

export class ChangeProxy<R> {
    private _state: EntityStates;
    private _isNew: boolean;
    private _entityObj: R;
    private _entity: Entity<R>;

    get state(): EntityStates { return this._state; }
    get obj(): R { return this._entityObj; }
    get entity(): Entity<R> { return this._entity; }
    get isDirty(): boolean { return this._state !== "unmodified"; }

    constructor(entity: Entity<R>, entityObject: R, isNew: boolean) {
        this._isNew = isNew;
        this._entity = entity;
        this._entityObj = entityObject;
        this._state = "unmodified";
    }

    setDirty(): ChangeProxy<R> {
        this._state = this._isNew ? "add" : "modified";
        return this;
    }

    setDelete(): ChangeProxy<R> {
        this._state = "delete";
        return this;
    }

    setCleaned(): ChangeProxy<R> {
        this._state = "unmodified";
        return this;
    }
    setSaved(): ChangeProxy<R> {
        this.setCleaned();
        if (this._isNew) {
            this._isNew = false;
            ObjectBuilder.rebuildKeys(this.obj, this.entity);
        }

        return this;
    }
}
