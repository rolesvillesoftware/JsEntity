import { IConnectionString } from "./MySqlConnection";

type connectionStringPart = "provider" | "host" | "user" | "password" | "database"

/**
 * Example connection string:
 * provider=mysql;host=server.domain.xxx;user=dbUser;password=dbPassword;database=defaultDb
 */
export class Connection implements IConnectionString {


    get host(): string {
        return this.getPart("host");
    }
    get user(): string {
        return this.getPart("user");
    }
    get password(): string {
        return this.getPart("password");
    }
    get database(): string {
        return this.getPart("database");
    }
    get connectionString(): string {
        return this._connectionString;
    }

    private getPart(partName: connectionStringPart): string {
        if (this._connectionString == null || this._connectionString.length === 0) { return ""; }
        const parts = this._connectionString.split(";");
        const _part = parts.find(part => part.split("=")[0].trim() === partName).split("=").map(item => item.trim());
        if (_part.length < 2) { return ""; }
        return _part[1];
    }
    constructor(private _connectionString: string) { }
}
