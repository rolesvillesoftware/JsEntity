import { ContextModel } from "./ContextModel";
import { Connection } from "./Connection";
import { IEntity } from "./Entity";
import { DbSet } from "./DbSet";
import { MySqlConnection, IConnectionString } from "./MySqlConnection";
import { Collection } from "./Collection";
import { ObjectBuilder } from "./ObjectBuilder";
import { ChangeProxy } from "./ChangeProxy";

import { SafePromise, SafeResult, Exception } from "@rolesvillesoftware/tools/dist";

export { IConnectionString, IQueryResult } from "./MySqlConnection";

/**
 * Main context class - Controls the entity framework class
 *
 * @export
 * @class Context
 */
export abstract class Context<X extends Context<X>> {
  private _contextModel: ContextModel<X> = null;
  private _dbConnection: MySqlConnection;

  private _attached = new Collection<ChangeProxy<any, X>>();

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
  protected abstract modelBuilder(model: ContextModel<X>): void;

  dbSet<T>(entityName: string, pojso: new () => T): DbSet<T, X> {
    const entity = this._contextModel.entities[entityName];
    if (entity == null) {
      throw new Exception(`Entity ${entity} not defined`);
    }
    return new DbSet<T, X>(pojso, entity, this);
  }

  attach<T>(proxy: ChangeProxy<T, X>): T {
    if (!(proxy instanceof ChangeProxy)) {
      throw new Exception("Object not context proxy");
    } else {
      this._attached.add(proxy);
      return proxy.obj;
    }
  }

  async saveChanges(): Promise<boolean> {
    if (this._attached == null || this._attached.count === 0) {
      return;
    }
    const dirty = this._attached.filter(item => item.isDirty);
    if (dirty != null) {
      for (const proxy of dirty) {
        let result: SafeResult<any> = null;
        switch (proxy.state) {
          case "modified":
            result = await SafePromise.run(() => proxy.entity.update(proxy.obj));
            break;
          case "add":
            result = await SafePromise.run(() => proxy.entity.insert(proxy.obj));
            break;
          case "delete":
            throw new Exception("Delete not supported yet");
        }
        if (result != null && result.isError) {
          throw new Exception(result.error);
        }
      }
    }
    return true;
  }

  runThenDispose(routine: (context: X, done: () => void) => void) {
    let done = () => {
      this.dispose();
    };
    routine(<X>(this as any), done);
  }

  private _disposed = false;
  private _disposing = false;
  dispose() {
    if (this._disposed) {
      return;
    }
    if (!this._disposing) {
      this._disposing = true;
      this._dbConnection.dispose();
      this._attached.clear();
      this._disposed = true;
      this._disposing = false;
    }
  }
}
