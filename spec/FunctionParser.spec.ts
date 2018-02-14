import { FunctionParser } from "../src/FunctionParser";
import { WhereParser } from "../src/WhereParser";

export class TestObject {
    fieldA: string;
    fieldB: number;
    fieldC: string;
    FieldD: Date;
}

describe('Test Function Parser', () => {
    const parser = new FunctionParser<TestObject, any>((item, binds) => { item.fieldA === binds.bindA }).parse();
    it('Test Parser Creation', () => {
        expect(parser).toBeDefined();
    });

    it('Test variable stripping', () => {
        expect(parser.fieldIdentifier).toEqual("item");
        expect(parser.bindIdentifier).toEqual("binds");
    });

    it ("Test sql build", () => {
        expect(parser.sql).toEqual(":fieldA: = @bindA@")
    });
});

