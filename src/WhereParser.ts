import { FunctionParser } from "./FunctionParser";
import { Entity } from "./Entity";

export class WhereParser<T, R> {

    private get fields(): { fields: string[]; binds: string[] } {
        return // new FunctionParser().getFields(this.func);
    }

    get sql(): string {
        let whereClause = this.func.toString();
        whereClause = this.substituteFields(whereClause);
        return whereClause;
    }

    constructor(private func: (item: T, bind: R) => boolean, private entity: Entity<T>) { }

    substituteFields(func: string): string {
        if (func == null || func.length === 0) { return ""; }

        const fields = this.fields;
        let whereClause = func.replace(/.*\{\s+return\s+/gi, " ").replace(/;\s*\}\s*/, " ").trim();

        return this.substituteOperands(whereClause);
    }

    substituteOperands(clause: string): string {
        let returnClause = clause;
        const substitutes = [
            {operand: "===", sql: "="},
            {operand: "==", sql: "="},
            {operand: "&&", sql: "AND"},
            {operand: "\\|\\|", sql: "OR"},
            {operand: '"', sql: "'"}
        ];

        substitutes.forEach(item => {
            const regExp = new RegExp(item.operand, "g");
            returnClause = returnClause.replace(regExp, item.sql);
        });
        return returnClause;
    }
}

