export interface IMapping {
    origField: string;
    newField: string;
    bindVariable: boolean;
};

export class FunctionParser<T, R> {

    private _identifiers: string[];
    private _fields: { fields: string[]; bindVariables: string[] };
    private _sql: string;

    get fieldIdentifier(): string {
        if (this._identifiers == null || this._identifiers.length === 0) { return null; }
        return this._identifiers[0];
    }
    get bindIdentifier(): string {
        if (this._identifiers == null || this._identifiers.length < 2) { return null; }
        return this._identifiers[1];
    }

    get sql(): string {
        return this._sql;
    }

    private get function$(): string {
        return this.func.toString();
    }

    constructor(private func: (item: T, bind: R) => any) {
    }

    parse(): FunctionParser<T, R> {
        this.parseIdentifier();
        this.getFields();
        this.parseSql();

        return this;
    }

    private getFields()  {
        if (this._identifiers.length == 0) { throw new Error("Unable to parse function - no varialbes"); }
        if (this._identifiers.length > 2) { throw new Error("To many identifier variables"); }
        if (this._identifiers[0] == this._identifiers[1]) { throw new Error("Unable to determine indentifier variables - non-unique"); }

        this._fields = {
            fields: this.function$.match(new RegExp(`${this._identifiers[0]}\\.\\w*`, "g")).map(item => item),
            bindVariables: this._identifiers.length == 2 ? this.function$.match(new RegExp(`${this._identifiers[1]}\\.\\w*`, "g")).map(item => item) : new Array<string>(0)
        };
    }

    private substituteVariables(variables: string[], sql: string, identifier: string): string {
        let returnString = sql;
        variables.forEach(item => {
            var parts = item.split(".");
            returnString = returnString.replace(item, `${identifier}${parts[1]}${identifier}`);
        });
       return returnString;
    }
    private parseSql() {
        let _sql = this.function$.match(/\{.*\}/).map(item => item);
        if (_sql.length === 0) { return; }
        _sql[0] = _sql[0].replace("{", "").replace("}", "").trim();
        _sql[0] = this.substituteVariables(this._fields.fields, _sql[0], ":");
        _sql[0] = this.substituteVariables(this._fields.bindVariables, _sql[0], "@");

        this._sql = this.substituteOperands(_sql[0]);
    }
    private parseIdentifier() {
        const regex = /\([a-z_$,\s]*?\)/i;
        const identifer = this.function$.match(regex).find(item => (item != null || item.length > 0) && item[0] === "(");
        if (identifer == null) { throw new Error("Invalid function"); }

        const $identifiers = identifer.replace("(", "").replace(")", "").trim();
        this._identifiers = $identifiers.split(",").map(ident => ident.trim());
    }
    private substituteOperands(clause: string): string {
        let returnClause = clause;
        const substitutes = [
            {operand: "===", sql: "="},
            {operand: "==", sql: "="},
            {operand: "&&", sql: "AND"},
            {operand: "\\|\\|", sql: "OR"},
            {operand: '"', sql: "'"},
            {operand: ';', sql: ""}
        ];

        substitutes.forEach(item => {
            const regExp = new RegExp(item.operand, "g");
            returnClause = returnClause.replace(regExp, item.sql);
        });
        return returnClause;
    }
}
