export interface IMapping {
    origField: string;
    newField: string;
};

export class FunctionParser<T> {

    constructor() {
    }

    buildObjectMapping(func: (item: T) => any): IMapping[] {
        const funcString = func.toString();
        const identifier = this.parseIdentifier(funcString);
        const regString = `(?:[a-zA-Z0-9_]+:${"\\s"}*)${identifier}.[a-zA-Z0-9_]+`;
        const fields = funcString.match(new RegExp(regString, "g"));

        var mapping: IMapping[] = [];
        fields
            .filter(item => item != null && item.length > 0)
            .forEach(field => {
                const newField = field.substr(0, field.indexOf(":"));
                const origField = field.substr(field.indexOf(":") + 1).replace(`${identifier}.`, " ").trim();

                if (newField != null && newField.length > 0 && origField != null && origField.length > 0) {
                    mapping.push({ origField: origField, newField: newField });
                }
            });
        return mapping;
    }
    getFields(func: (item: T) => any): string[] {
        const funcString = func.toString();
        const identifier = this.parseIdentifier(funcString);
        const regString = `${identifier}\.[a-zA-Z0-9_]+`;
        const fields = funcString.match(new RegExp(regString, "g"));

        return fields.filter(item => item != null && item.length > 0);
    }

    private parseIdentifier(func: string): string {
        const regex = /(?:\()\s*[a-zA-Z0-9_]+/gi;
        const identifer = func.match(regex).find(item => (item != null || item.length > 0) && item[0] === "(");
        if (identifer == null) { throw new Error("Invalid function"); }
        return identifer.replace("(", "").replace(")", "").trim();
    }
}
