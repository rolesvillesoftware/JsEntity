import { IActiveQuery } from "./IBaseQuery";
import { Entity, IFieldMap } from "./Entity";
import { WhereParser } from "./WhereParser";
import { SqlGenerator } from "./SqlGenerator";
import { Context, IQueryResult } from "./Context";
import { Collection } from "./Collection";

import { Observable } from "rxjs";
import { ObjectBuilder } from "./ObjectBuilder";

export class ActiveQuery<T> implements IActiveQuery<T> {

    private sqlGen: SqlGenerator;
    get sql(): string {
        return this.sqlGen.sql;
    }

    constructor(private pojso: new () => T, private entity: Entity<T>, private context: Context) {
        this.sqlGen = new SqlGenerator("select");
        this.setTable(this.entity.schema, this.entity.tableName);
    }

    private setTable(schema?: string, tableName?: string) {
        let from = "";
        if (schema != null && schema.length > 0) { from += `${schema}.`; }
        from += tableName || '';
        this.sqlGen.addFrom(from);
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
    where(clause: (item: T) => boolean): IActiveQuery<T> {
        this.sqlGen.addWhere(new WhereParser(clause, this.entity).sql);
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
                .runQuery(this.sqlGen.sql)
                .catch(error => {
                    observer.error(error);
                })
                .then((data: IQueryResult) => {
                    if (data == null || data.results == null || data.results.length === 0) { observer.next(new Collection<T>()); }
                    else {
                        const collection = new Collection<T>();
                        data.results.forEach(element => {
                            const obj: T = ObjectBuilder.createObject(this.entity.pojso, element, this.entity.fields, false);
                            collection.add(obj);
                            this.context.attach(obj);
                        });
                        observer.next(collection);
                    }
                    observer.complete();
                });
        });
    }

}
