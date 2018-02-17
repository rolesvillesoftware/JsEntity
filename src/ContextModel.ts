import { Context } from "./Context";
import { Entity, IEntity } from "./Entity";
import { CLIENT_RENEG_LIMIT } from "tls";

/**
 * Model builder and model control class
 */
export class ContextModel<CTX extends Context<CTX>> {

    private _entities: {} = {};

    get entities(): {} {
        return this._entities;
    }
    /**
     * Constructor
     *
     * @constructor
     * @param parentContext Parent / Associated context for the model
     */
    constructor(private parentContext: Context<CTX>) {
    }

    add<T>(entityName: string, pojso: new () => T, tableName?: string, schema?: string): Entity<T, CTX> {
        const entity = new Entity<T, CTX>(this.parentContext, entityName, pojso, tableName, schema);
        this._entities[entityName] = entity;
        return entity;
    }

    listEntities(): IEntity[] {
        const returnArray: IEntity[] = new Array<IEntity>(0);
        Object.keys(this._entities).forEach(element => {
            returnArray.push(this._entities[element]);
        });
        return returnArray;
    }
}
