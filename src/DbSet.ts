import { Entity } from "./Entity";
import { IBaseQuery, IActiveQuery } from "./IBaseQuery";
import { ActiveQuery } from "./ActiveQuery";
import { WhereParser } from "./WhereParser";
import { Context } from "./Context";
import { ObjectBuilder } from "./ObjectBuilder";
import { Collection } from "./Collection";

export class DbSet<T, CTX extends Context<CTX>> implements IBaseQuery<T> {

    constructor(private pojso: new () => T, public entity: Entity<T, CTX>, private context: Context<CTX>) { }

    select(fields?: string | string[]): IActiveQuery<T> {
        return new ActiveQuery(this.pojso, this.entity, this.context).select(fields);
    }

    where<B>(clause: (item: T, binds: B) => boolean, bindObj?: B): IActiveQuery<T> {
        return new ActiveQuery(this.pojso, this.entity, this.context).select().where(clause, bindObj);
    }

    create<B>(bindObj?: B): T {
        const source = {};
        let isDirty = false;
        this.entity.fields.forEach(field => {
            source[field.propertyName] = (bindObj || {})[field.propertyName] || null;
            if (source[field.propertyName] != null) { isDirty = true; }
        });
        const obj = ObjectBuilder.createObject(this.pojso, source, this.entity, true);
        if (isDirty) { obj.setDirty(); }
        return this.context.attach(obj);
    }

    async selectOrCreate(clause: (item: T, binds: T) => boolean, bindObj?: T): Promise<Collection<T>> {
        const query = this.where(clause, bindObj);
        var results = await query.execute().toPromise();

        if (results == null || results.count === 0) {
            return new Collection<T>().addRange( [ this.create(bindObj) ]);
        }
        return results;
    }
}
