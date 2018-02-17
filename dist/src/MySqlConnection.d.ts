import * as mysql from "mysql";
import { SqlGenerator } from "./SqlGenerator";
export interface IQueryResult {
    results: any;
    fields: mysql.FieldInfo[];
}
export interface ILogger {
    log(message: string): void;
    error(message: string): void;
    debug(message: string): void;
}
export interface IConnectionString {
    host: string;
    user: string;
    password: string;
    database: string;
}
export declare class MySqlConnection {
    private logger;
    debug: boolean;
    private pool;
    constructor(connectionString: IConnectionString, logger?: ILogger);
    runQuery(sqlGenerator: SqlGenerator): Promise<IQueryResult>;
    dispose(): void;
}
