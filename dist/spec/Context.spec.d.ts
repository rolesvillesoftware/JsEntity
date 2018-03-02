import { Context } from "../src/Context";
import { ContextModel } from "../src/ContextModel";
import { DbSet } from "../src/DbSet";
export declare class TestModel {
    dbId: number;
    name: string;
    date: any;
}
export declare class TestContext extends Context<TestContext> {
    testModel: DbSet<TestModel, TestContext>;
    protected modelBuilder(model: ContextModel<TestContext>): void;
}
