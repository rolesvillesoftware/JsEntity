import { ContextModel } from "./ContextModel";
import { Connection } from "./Connection";
import { IEntity } from "./Entity";
import { DbSet } from "./DbSet";
import { MySqlConnection, IConnectionString } from "./MySqlConnection";
import { Collection } from "./Collection";
import { ObjectBuilder } from "./ObjectBuilder";

export { IConnectionString, IQueryResult } from "./MySqlConnection";

export interface IAttachedObject {
    _$$isDirty$$: boolean;
    _$$proxy$$: boolean;
}
/**
 * Main context class - Controls the entity framework class
 *
 * @export
 * @class Context
 */
export abstract class Context {
    private _contextModel: ContextModel = null;
    private _dbConnection: MySqlConnection;

    private _attached = new Collection<{}>();

    get Database(): MySqlConnection {
        return this._dbConnection;
    }

    /**
     * List the entity definitions from the model
     */
    get entityDefinitions(): IEntity[] {
        return this._contextModel.listEntities();
    }

    /**
     * @constructor
     */
    constructor(private connectionString: IConnectionString) {
        this._contextModel = new ContextModel(this);
        this.modelBuilder(this._contextModel);
        this._dbConnection = new MySqlConnection(connectionString);
    }

    /**
     * Build the context model
     *
     * @abstract
     * @param model
     */
    protected abstract modelBuilder(model: ContextModel): void;

    dbSet<T>(entityName: string, pojso: new () => T): DbSet<T> {
        const entity = this._contextModel.entities[entityName];
        if (entity == null) { throw new Error(`Entity ${entity} not defined`); }
        return new DbSet<T>(pojso, entity, this);
    }

    attach<T>(obj: T): T {
        if (obj["_$$proxy$$"] == null) {
            throw new Error("Object not context proxy");
        } else {
            this._attached.add(obj);
            return obj;
        }
    }

    saveChanges() {
        if (this._attached == null || this._attached.count === 0) { return; }
        this._attached.filter(item => item[" _$$isDirty$$"]).forEach(entity => {

        });
    }
    dispose() {
        this._dbConnection.dispose();
        this._attached.clear();
    }
}
