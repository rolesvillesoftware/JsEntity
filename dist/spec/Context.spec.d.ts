import { Context } from "../src/Context";
import { ContextModel } from "../src/ContextModel";
import { DbSet } from "../src/DbSet";
export declare class TestModel {
    dbId: number;
    name: string;
    date: Date;
}
export declare class TestContext extends Context {
    testModel: DbSet<TestModel>;
    protected modelBuilder(model: ContextModel): void;
}
