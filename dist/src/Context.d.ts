import { ContextModel } from "./ContextModel";
import { IEntity } from "./Entity";
import { DbSet } from "./DbSet";
import { MySqlConnection, IConnectionString } from "./MySqlConnection";
import { ChangeProxy } from "./ChangeProxy";
export { IConnectionString, IQueryResult } from "./MySqlConnection";
export declare abstract class Context<X extends Context<X>> {
    private connectionString;
    private _contextModel;
    private _dbConnection;
    private _attached;
    readonly Database: MySqlConnection;
    readonly entityDefinitions: IEntity[];
    constructor(connectionString: IConnectionString);
    protected abstract modelBuilder(model: ContextModel<X>): void;
    dbSet<T>(entityName: string, pojso: new () => T): DbSet<T, X>;
    attach<T>(proxy: ChangeProxy<T, X>): T;
    saveChanges(): Promise<boolean>;
    runThenDispose(routine: (context: X, done: () => void) => void): void;
    private _disposed;
    private _disposing;
    dispose(): void;
}
