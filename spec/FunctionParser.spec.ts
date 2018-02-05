import { FunctionParser } from "../src/FunctionParser";

export class TestObject {
    fieldA: string;
    fieldB: number;
    fieldC: string;
    FieldD: Date;
}

describe('Test Build Object feature', () => {
    const parser = new FunctionParser<TestObject>();
    it('Test Parser Creation', () => {
        expect(parser).toBeDefined();
    });

    it('Object mapper', () => {
        const map = parser.buildObjectMapping(item => { return { fieldA: item.fieldA } });
        expect(map.length).toEqual(1);
    });

    it (`Field finder`, () => {
        let fields = parser.getFields(item => item.fieldA === "W" && item.fieldB === 43 && item.FieldD === new Date("12/31/2017"))
        expect(fields.length).toEqual(3);

        fields = parser.getFields(item => item.fieldA === "W" && item.fieldB === 43 && item.FieldD === new Date(12/31/2017))
        expect(fields.length).toEqual(3);
    });
});
