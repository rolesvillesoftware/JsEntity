export class Connection {
    get connectionString(): string {
        return this._connectionString; 
    }
    
    constructor (private _connectionString: string) {

    }
}