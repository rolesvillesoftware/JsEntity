import { Observable } from "rxjs";
import { Collection } from "./Collection";

export interface IActiveQuery<T> extends IBaseQuery<T> {
    sql: string;
    execute(): Observable<Collection<T>>;
}

export interface IBaseQuery<T> {
    select(fields?: string | string[]): IActiveQuery<T>;
    where(clause: (item: T) => boolean ): IActiveQuery<T>;
}
