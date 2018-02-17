import { Entity } from "./Entity";
import { ObjectBuilder } from "./ObjectBuilder";
import { Context } from "./Context";

export type EntityStates = "unmodified" | "add" | "modified" | "delete";

export class ChangeProxy<R, CTX extends Context<CTX>> {
    private _state: EntityStates;
    private _isNew: boolean;
    private _entityObj: R;
    private _entity: Entity<R, CTX>;

    get state(): EntityStates { return this._state; }
    get obj(): R { return this._entityObj; }
    get entity(): Entity<R, CTX> { return this._entity; }
    get isDirty(): boolean { return this._state !== "unmodified"; }

    constructor(entity: Entity<R, CTX>, entityObject: R, isNew: boolean) {
        this._isNew = isNew;
        this._entity = entity;
        this._entityObj = entityObject;
        this._state = "unmodified";
    }

    setDirty(): ChangeProxy<R, CTX> {
        this._state = this._isNew ? "add" : "modified";
        return this;
    }

    setDelete(): ChangeProxy<R, CTX> {
        this._state = "delete";
        return this;
    }

    setCleaned(): ChangeProxy<R, CTX> {
        this._state = "unmodified";
        return this;
    }
    setSaved(): ChangeProxy<R, CTX> {
        this.setCleaned();
        if (this._isNew) {
            this._isNew = false;
            ObjectBuilder.rebuildKeys(this.obj, this.entity);
        }

        return this;
    }
}
