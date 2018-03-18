import { Context } from "../src/Context";
import { ContextModel } from "../src/ContextModel";
import { DbSet } from "../src/DbSet";
import { Collection } from "../src/Collection";
export declare class TestChildren {
    id: number;
    ParentId: number;
    childName: string;
}
export declare class TestModel {
    dbId: number;
    name: string;
    date: any;
    children: Collection<TestChildren>;
}
export declare class TestContext extends Context<TestContext> {
    testModel: DbSet<TestModel, TestContext>;
    protected modelBuilder(model: ContextModel<TestContext>): void;
}
