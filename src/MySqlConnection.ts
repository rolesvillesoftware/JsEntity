import * as mysql from "mysql";
import { SqlGenerator } from "./SqlGenerator";

export interface IQueryResult {
    results: any;
    fields: mysql.FieldInfo[];
}
export interface ILogger {
    log (message: string): void;
    error (message: string): void;
    debug (message: string): void;
}
export interface IConnectionString {
    host: string;
    user: string;
    password: string;
    database: string;
}
export class MySqlConnection {
    public debug = false;
    private pool: mysql.Pool;

    constructor(connectionString: IConnectionString, private logger?: ILogger) {
        this.pool = mysql.createPool(connectionString);

        this.pool.on("acquire", connection => {
            if (this.debug) this.logger.log(`Connection to database ${connection.config.host} acquired.`);
        });

        this.pool.on("connection", connection => {
            if (this.debug) this.logger.log(`Database connection ${connection.threadId} connected`);
        });

        this.pool.on("enqueue", () => {
            if (this.debug) this.logger.log("Waiting for database connection");
        });

        this.pool.on("release", connection => {
            if (this.debug) this.logger.log(`Database connection ${connection.threadId} released`);
        });

        if (this.debug) this.logger.log(`Connection pool to ${connectionString.host} created`);
    }

    public runQuery(sqlGenerator: SqlGenerator): Promise<IQueryResult> {
        return new Promise<{ results: any; fields: mysql.FieldInfo[] }>(
            (response, reject) => {
                this.pool.getConnection(
                    (err, connection) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        connection.query(sqlGenerator.sqlObj, (err, results, fields) => {
                            connection.release();
                            if (err) {
                                reject(err);
                                return;
                            }
                            response({ results: results, fields: fields });
                        });
                    });
            });
    }

    public dispose() {
        this.pool.end(err => {
            if (err) {
                this.logger.error(`Error closing pool: ${err.message}`);
                return;
            }

            if (this.debug) { this.logger.log("Database pool closed"); }
        });
    }
}
