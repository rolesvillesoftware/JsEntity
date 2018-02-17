import * as jasmineReporters from "jasmine-reporters";
import { Context } from "../src/Context";
import { Connection } from "../src/Connection";
import { ContextModel } from "../src/ContextModel";
import { DbSet } from "../src/DbSet";
import { ChangeProxy } from "../src/ChangeProxy";

const _connectionString = "provider=mysql;host=mysql.rolesvillesoftware.com;user=tiber;password=Tiber$45;database=TiberDM"
const connection = new Connection(_connectionString);

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

describe('Context Model Builder', () => {
    let context = new TestContext(connection);
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

describe('Query Builder', () => {
    let context = new TestContext(connection);
    it('Test simple select', () => {
        let query = context.testModel.select();
        let sql = query.sql;

        expect(sql).toBeDefined();
        expect(sql.length).toBeGreaterThan(0);
        expect(sql.indexOf("SELECT\n")).toEqual(0);
        expect(sql).toContain("\FROM\n");
    });

    it('Test simple select of field subset', () => {
        let query = context.testModel.select();
        expect(query.sql).toBeDefined();
        expect(query.sql).toContain("SELECT\n");
        expect(query.sql).toContain("\FROM\n");
    });

    it(`Test where clause creation`, () => {
        let query = context.testModel.where(item => item.dbId === 3);
        expect(query.sql.match(/WHERE\s*\(id\s*=\s*3\)/)).toBeDefined();
    });

    it('Test where clause with binds', (done) => {
        let query = context.testModel.where(
            (item, binds) => item.dbId === binds.idField && item.dbId === 3 && item.name === binds.peter && 3 === 3,
            { idField: 3, peter: "bryan" });

        query.execute().toPromise()
            .catch(data => {
                done();
            })
            .catch(error => {
                fail(new Error(error));
                done();
            })
    });

    it(`Test multiple where`, () => {
        let query = context.testModel.where(item => item.dbId === 3 && item.name != "Peter");
        expect(query.sql.match(/WHERE\s*\(id\s*=\s*3\)\s*AND\s*\(\s*name\s*!=\s*'Peter'/)).toBeDefined();

        let queryB = context.testModel.where(item => item.dbId === 3 || item.name === "Peter").where(item => item.name != "Roger");
    });

    it(`Test run time query binding`, () => {
        var query = context.dbSet("testModel", Object);
    });

    context.dispose();
});

describe('Query Execute', () => {
    const context = new TestContext(connection);
    let query = context.testModel.select();
    it('Test Query Execution', (done) => {
        query.execute()
            .toPromise()
            .then(data => {
                try {
                    expect(data.count).toBeGreaterThan(0);
                    data.forEach(element => {
                        expect(element["proxy"] instanceof ChangeProxy).toBeTruthy();
                        expect(element["proxy"].isDirty).toBeFalsy();
                    });
                    expect((context as any)["_attached"].count).toEqual(data.count);

                    /** test changing an element */
                    const tObj = data.get(0);
                    tObj.name = "new name";
                    expect(tObj["proxy"].isDirty).toBeTruthy();

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
describe("Test Where binding", () => {
    const context = new TestContext(connection);
    it("Test Bind Where - no binds", (done) => {
        context.testModel.where(item => item.dbId === 7)
            .execute()
            .toPromise()
            .then(results => {
                expect(results.count).toEqual(1);
                expect(results.toArray()[0].dbId).toEqual(7);
                expect(results.toArray()[0].name).toEqual("roger");
                done();
            })
            .catch(error => {
                fail(new Error(error));
                done();
            })
    }, 120000);
    it("Test bind where - binds 1", (done) => {
        context.testModel.where((item, bind) => item.dbId === bind.pullId, { pullId: 8 })
            .execute()
            .toPromise()
            .then(results => {
                expect(results.count).toEqual(1);
                expect(results.toArray()[0].dbId).toEqual(8);
                expect(results.toArray()[0].name).toEqual("david");
                done();
            })
            .catch(error => {
                fail(new Error(error));
                done();
            })

    }, 120000);

    it("Test bind where - binds 2 - multiple binds ", (done) => {
        context.testModel.where((item, bind) => item.dbId === bind.pullId && item.name === bind.nameFilter, { pullId: 8, nameFilter: "david" })
            .execute()
            .toPromise()
            .then(results => {
                expect(results.count).toEqual(1);
                expect(results.toArray()[0].dbId).toEqual(8);
                expect(results.toArray()[0].name).toEqual("david");
                done();
            })
            .catch(error => {
                fail(new Error(error));
                done();
            })

    }, 120000);

    it("Test bind where - binds 2 - multiple binds sane value ", (done) => {
        context.testModel.where((item, bind) => item.dbId === bind.pullId && item.dbId === bind.pullId, { pullId: 8, nameFilter: "david" })
            .execute()
            .toPromise()
            .then(results => {
                expect(results.count).toEqual(1);
                expect(results.toArray()[0].dbId).toEqual(8);
                expect(results.toArray()[0].name).toEqual("david");
                done();
            })
            .catch(error => {
                fail(new Error(error));
                done();
            })

    }, 120000);

});

describe('Create Entity', () => {
    const context = new TestContext(connection);
    let obj = context.testModel.create();
    it('Test entity object creation', () => {
        expect(obj).toBeDefined();
        expect(obj["proxy"].state).toEqual("unmodified");
        expect(obj["proxy"].isDirty).toBeFalsy();
        expect((context as any)["_attached"].count).toEqual(1);
    });

    it('Test adding values', () => {
        obj.name = "Test Name 1";
        expect(obj["proxy"].state).toEqual("add");
        expect(obj.name).toBeDefined();
        expect(obj.name).toEqual("Test Name 1");
        expect(obj["proxy"].isDirty).toBeTruthy();

        obj.date = new Date();
        expect(obj["proxy"].isDirty).toBeTruthy();
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

                    expect(obj["proxy"].isDirty).toBeFalsy();
                    expect(obj["proxy"].state).toEqual("unmodified");
                } catch (ex) {
                    fail(ex);
                    done();
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
        expect(obj["proxy"].isDirty).toBeTruthy();
        context.saveChanges()
            .catch(error => {
                fail(error);
                done();
            })
            .then(data => {
                try {
                    expect(obj.name).toEqual("New Object Name");
                    expect(obj.dbId).toEqual(origId);
                    expect(obj["proxy"].isDirty).toBeFalsy();
                    expect(obj["proxy"].state).toEqual("unmodified");
                } catch (ex) {
                    fail(ex);
                    done();
                } finally {
                    done();
                }
            });
    }, 120000);

})



