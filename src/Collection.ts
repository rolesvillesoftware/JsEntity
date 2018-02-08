export class Collection<T> {

    private _collection: Array<T> = new Array<T>(0);

    get count() {
        return this._collection.length;
    }

    add(obj: T): T {
        if (this._collection.find(item => item === obj) != null) { throw new Error("Item already part of the collection"); }
        this._collection.push(obj);
        return obj;
    }

    clear(): Collection<T> {
        this._collection = new Array<T>(0);
        return this;
    }

    remove(obj: T): boolean {
        const removedItem = this._collection.find(item => item === obj);
        if (removedItem == null ) { return false; }

        this._collection = this._collection.filter(item => item !== removedItem);
        return true;
    }

    filter(filter: (item: T, index?: number) => any ): T[] {
        return this._collection.filter(filter);
    }

    forEach(func: (item: T) => void) {
        this._collection.forEach(func);
    }
    toArray(): T[] {
        return this._collection;
    }
}
