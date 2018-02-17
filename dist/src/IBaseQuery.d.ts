import { Observable } from "rxjs";
import { Collection } from "./Collection";
export interface IActiveQuery<T> extends IBaseQuery<T> {
    sql: string;
    execute(): Observable<Collection<T>>;
}
export interface IBaseQuery<T> {
    select(fields?: string | string[]): IActiveQuery<T>;
    where<B>(clause: (item: T, binds: B) => boolean, bindObj?: B): IActiveQuery<T>;
}
