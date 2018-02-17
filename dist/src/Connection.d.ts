import { IConnectionString } from "./MySqlConnection";
export declare class Connection implements IConnectionString {
    private _connectionString;
    readonly host: string;
    readonly user: string;
    readonly password: string;
    readonly database: string;
    readonly connectionString: string;
    private getPart(partName);
    constructor(_connectionString: string);
}
