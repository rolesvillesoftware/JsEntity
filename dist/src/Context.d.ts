import { ContextModel } from "./ContextModel";
import { IEntity } from "./Entity";
import { DbSet } from "./DbSet";
import { MySqlConnection, IConnectionString } from "./MySqlConnection";
import { ChangeProxy } from "./ChangeProxy";
export { IConnectionString, IQueryResult } from "./MySqlConnection";
export declare abstract class Context {
    private connectionString;
    private _contextModel;
    private _dbConnection;
    private _attached;
    readonly Database: MySqlConnection;
    readonly entityDefinitions: IEntity[];
    constructor(connectionString: IConnectionString);
    protected abstract modelBuilder(model: ContextModel): void;
    dbSet<T>(entityName: string, pojso: new () => T): DbSet<T>;
    attach<T>(proxy: ChangeProxy<T>): T;
    saveChanges(): Promise<boolean | string>;
    runThenDispose(routine: (context, done: () => void) => void): void;
    private _disposed;
    private _disposing;
    dispose(): void;
}
