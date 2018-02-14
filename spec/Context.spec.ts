import * as jasmineReporters from "jasmine-reporters";
import { Context, IConnectionString } from "../src/Context";
import { ContextModel } from "../src/ContextModel";
import { DbSet } from "../src/DbSet";
import { entityFlags } from "../src/ObjectBuilder";

var connectionString: IConnectionString = {
    "host": "mysql.rolesvillesoftware.com",
    "user": "tiber",
    "password": "Tiber$45",
    "database": "TiberDM"
};

export class TestModel {
    dbId: number;
    name: string;
    date: Date;
}

export class TestContext extends Context {

    testModel: DbSet<TestModel>;

    protected modelBuilder(model: ContextModel): void {
        let entity = model
            .add("testModel", TestModel, "TestModel", "JsEntityTest")
            .map({
                dbId: { fieldName: "id", propertyName: "dbId", primaryKey: true, identity: true },
                name: "name",
                date: "startDate"
            });
    }
}

xdescribe('Context Model Builder', () => {
    let context = new TestContext(connectionString);
    it('Test Context Creation', () => {
        expect(context.entityDefinitions.length).toEqual(1);
        expect(context.testModel).toBeDefined();
    });

    it('Test Entity Creation', () => {
        expect(context.testModel.entity).toBeDefined();
        expect(context.testModel.entity.fields).toBeDefined();
        expect(context.testModel.entity.fields.length).toEqual(3);
    });

    it('Test key generation', () => {
        expect(context.testModel.entity.fields.find(item => item.propertyName === "dbId").primaryKey).toBeTruthy();
    });
    context.dispose();
});

xdescribe('Query Builder', () => {
    let context = new TestContext(connectionString);
    it('Test simple select', () => {
        let query = context.testModel.select();
        let sql = query.sql;

        expect(sql).toBeDefined();
        expect(sql.length).toBeGreaterThan(0);
        expect(sql.indexOf("select")).toEqual(0);
        expect(sql).toContain("from");
    });

    it('Test simple select of field subset', () => {
        let query = context.testModel.select();
        expect(query.sql).toBeDefined();
        expect(query.sql).toContain("select");
        expect(query.sql).toContain("from");
    });

    it(`Test where clause creation`, () => {
        let query = context.testModel.where(item => item.dbId === 3);
        expect(query.sql.match(/where\s*\(id\s*=\s*3\)/)).toBeDefined();
    });
    it(`Test multiple where`, () => {
        let query = context.testModel.where(item => item.dbId === 3 && item.name != "Peter");
        expect(query.sql.match(/where\s*\(id\s*=\s*3\)\s*AND\s*\(\s*name\s*!=\s*'Peter'/)).toBeDefined();

        let queryB = context.testModel.where(item => item.dbId === 3 || item.name === "Peter").where(item => item.name != "Roger");
    });
    it(`Test run time query binding`, () => {
        var query = context.dbSet("testModel", Object);
    });
    context.dispose();
});

xdescribe('Query Execute', () => {
    const context = new TestContext(connectionString);
    let query = context.testModel.select();
    it('Test Query Execution', (done) => {
        query.execute()
            .toPromise()
            .then(data => {
                try {
                    expect(data.count).toBeGreaterThan(0);
                    data.forEach(element => {
                        expect((element as any)[entityFlags.isProxy]).toBeTruthy();
                        expect((element as any)[entityFlags.isDirty]).toBeFalsy();
                    });
                    expect((context as any)["_attached"].count).toEqual(data.count);

                    /** test changing an element */
                    const tObj = data.get(0);
                    tObj.name = "new name";
                    expect((tObj as any)[entityFlags.isDirty]).toBeTruthy();

                    context.dispose();
                    expect((context as any)["_attached"].count).toEqual(0);
                } catch (ex) {
                    fail(ex);
                } finally {
                    done();
                }
            })
            .catch(error => {
                fail(error);
                done();
            });
    }, 120000);
});

xdescribe('Create Entity', () => {
    const context = new TestContext(connectionString);
    let obj = context.testModel.create();
    it('Test entity object creation', () => {
        expect(obj).toBeDefined();
        expect(obj[entityFlags.isUpdate]).toBeFalsy();
        expect(obj[entityFlags.isDirty]).toBeFalsy();
        expect((context as any)["_attached"].count).toEqual(1);
    });

    it('Test adding values', () => {
        obj.name = "Test Name 1";
        expect(obj.name).toBeDefined();
        expect(obj.name).toEqual("Test Name 1");
        expect(obj[entityFlags.isDirty]).toBeTruthy();
        expect(obj[entityFlags.isUpdate]).toBeFalsy();

        obj.date = new Date();
        expect(obj[entityFlags.isDirty]).toBeTruthy();
        expect((context as any)["_attached"].count).toEqual(1);
    });

    it('Test physical save', (done) => {
        context.saveChanges()
            .catch(error => {
                fail(error);
                done();
            })
            .then(data => {
                try {
                    expect(obj.dbId).toBeDefined();
                    expect(obj.dbId).toBeGreaterThan(-1);

                    expect(obj[entityFlags.isDirty]).toBeFalsy();
                    expect(obj[entityFlags.isUpdate]).toBeTruthy();
                } catch (ex) {
                    fail(ex);
                } finally {
                    done();
                }
            });
    }, 120000);

    it('Test key lock', () => {
        expect(() => {
            obj.dbId = 9999;
        }).toThrowError("Unable to update key field. Please create/clone a new record.");
    });

    it(`Test Update`, (done) => {
        expect(obj.name).toEqual("Test Name 1");
        obj.name = "New Object Name";
        const origId = obj.dbId;
        expect(obj[entityFlags.isDirty]).toBeTruthy();
        context.saveChanges()
            .catch(error => {
                fail(error);
                done();
            })
            .then(data => {
                try {
                    expect(obj.name).toEqual("New Object Name");
                    expect(obj.dbId).toEqual(origId);
                    expect(obj[entityFlags.isDirty]).toBeFalsy();
                    expect(obj[entityFlags.isUpdate]).toBeTruthy();
                } catch (ex) {
                    fail(ex);
                } finally {
                    done();
                }
            });
    }, 120000);
})

