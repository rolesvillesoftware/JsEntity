import { IActiveQuery } from "./IBaseQuery";
import { Entity, IFieldMap } from "./Entity";
import { WhereParser } from "./WhereParser";
import { SqlGenerator } from "./SqlGenerator";
import { Context, IQueryResult } from "./Context";
import { Collection } from "./Collection";

import { Observable } from "rxjs";
import { ObjectBuilder } from "./ObjectBuilder";

export class ActiveQuery<T, CTX extends Context<CTX>> implements IActiveQuery<T> {

    private sqlGen: SqlGenerator;
    private bindIndex = 0;

    get sql(): string {
        return this.sqlGen.sql;
    }

    constructor(private pojso: new () => T, private entity: Entity<T, CTX>, private context: Context<CTX>) {
        this.sqlGen = new SqlGenerator("select");
        this.sqlGen.addFrom(entity.qualifiedTable)
    }
    /**
     * Initiates and/or sets the fields to return
     *
     * @param fields Fields to be selected
     */
    select(fields?: string | string[]): IActiveQuery<T> {
        this.sqlGen.clearFields();
        if (fields == null) {
            this.entity.fields.forEach(field => {
                this.sqlGen.addField(field);
            });
        }
        return this;
    }
    /**
     * Sets up the where clause for the
     * @param clause Where clause to be added;
     */
    where<B>(clause: (item: T, binds: B) => boolean, bindObj?: B): IActiveQuery<T> {
        this.sqlGen.addWhere(new WhereParser(clause, bindObj, this.entity));
        return this;
    }
    /**
     * Executes the query
     * @param pojso Constructor Object to return results (Null == Default)
     */
    execute(): Observable<Collection<T>> {
        return Observable.create(observer => {
            this.context
                .Database
                .runQuery(this.sqlGen)
                .catch(error => {
                    observer.error(error);
                })
                .then((data: IQueryResult) => {
                    if (data == null || data.results == null || data.results.length === 0) { observer.next(new Collection<T>()); }
                    else {
                        const collection = new Collection<T>();
                        data.results.forEach(element => {
                            const proxy = ObjectBuilder.createObject(this.entity.pojso, element, this.entity, false);
                            collection.add(proxy.obj);
                            this.context.attach(proxy);
                        });
                        observer.next(collection);
                    }
                    observer.complete();
                });
        });
    }

}
