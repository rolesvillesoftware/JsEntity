import { Entity } from "./Entity";
import { IBaseQuery, IActiveQuery } from "./IBaseQuery";
import { ActiveQuery } from "./ActiveQuery";
import { WhereParser } from "./WhereParser";
import { Context } from "./Context";
import { ObjectBuilder } from "./ObjectBuilder";

export class DbSet<T> implements IBaseQuery<T> {

    constructor(private pojso: new () => T, public entity: Entity<T>, private context: Context) { }

    select(fields?: string | string[]): IActiveQuery<T> {
        return new ActiveQuery(this.pojso, this.entity, this.context).select(fields);
    }

    where(clause: (item: T) => boolean): IActiveQuery<T> {
        return new ActiveQuery(this.pojso, this.entity, this.context).select().where(clause);
    }

    create(): T {
        const source = {};
        this.entity.fields.forEach(field => {
            source[field.propertyName] = null;
        });
        return this.context.attach(ObjectBuilder.createObject(this.pojso, source, this.entity.fields, true));
    }
}
