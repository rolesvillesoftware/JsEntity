export class Collection<T> {
  private _collection: Array<T> = new Array<T>(0);

  get uniqueCollection(): boolean {
    return this.uniqueItems;
  }
  get count() {
    return this._collection.length;
  }

  get isSingle(): boolean {
    return this.count === 1;
  }
  get isEmpty(): boolean {
    return this.count === 0;
  }
  get hasElements(): boolean {
    return this.count > 0;
  }
  constructor(private uniqueItems?: boolean) {

  }
  add(obj: T): T {
    if (this.uniqueItems && this._collection.find(item => item === obj) != null) {
      throw new Error("Item already part of the collection");
    }
    this._collection.push(obj);
    return obj;
  }

  addRange(objs: T[]): Collection<T> {
    if (objs == null || objs.length === 0 || !(objs instanceof Array)) {
      return;
    }
    this._collection = this._collection.concat(objs);
    return this;
  }

  clear(): Collection<T> {
    this._collection = new Array<T>(0);
    return this;
  }

  remove(obj: T): boolean {
    const removedItem = this._collection.find(item => item === obj);
    if (removedItem == null) {
      return false;
    }

    this._collection = this._collection.filter(item => item !== removedItem);
    return true;
  }

  filter(filter: (item: T, index?: number) => any): T[] {
    return this._collection.filter(filter);
  }

  forEach(func: (item: T) => void) {
    this._collection.forEach(func);
  }

  toArray(): T[] {
    return this._collection;
  }

  get(position?: number): T {
    if (this._collection.length > position) {
      return this._collection[position];
    } else {
      throw new Error("Collection Index out of range");
    }
  }

  firstOrNull(): T {
    if (this.isEmpty) {
      return null;
    }
    return this.first();
  }

  first(): T {
    if (this.isEmpty) {
      throw new Error("No records found in collection");
    }
    return this._collection[0];
  }

  singleOrNull(): T {
    if (this.isEmpty) {
      return null;
    }
    return this.single();
  }

  single(): T {
    if (this.isEmpty) {
      throw new Error("No records found in collection");
    }
    if (!this.isSingle) {
      throw new Error("More than one record found in collection.");
    }
    return this.first();
  }
}
