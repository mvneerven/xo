const Core = window.xo.core;

class ExoFormSchemaModel {
    _mode = null
    _pageIndex = 0;
    _fieldCount = 0;
    _rawData = null;

    constructor(context) {
        this.events = new Core.Events(this); // add simple event system
        this._xoSchema = context.createSchema();
    }

    restoreCache(cache) {
        this._cacheFound = true;
        this._rawData = cache;
        this.load(cache);
    }

    load(schema) {
        this._rawData = schema;
        this._xoSchema.parse(schema);
    }

    get type() {
        return this._xoSchema.type || "json";
    }

    get cacheFound() {
        return this._cacheFound;
    }

    toString() {
        return this._xoSchema.toString();
    }

    get data() {
        return this._xoSchema.data;
    }

    get rawData() {
        return this._rawData;
    }

    get(name) {
        return this.data[name];
    }

    set(name, value) {
        this.data[name] = value;
        this._change();
    }

    _change() {
        this._rawData = null;
        this.events.trigger("change");
    }

    get page() {
        return this._pageIndex + 1;
    }

    set page(value) {
        this._pageIndex = value - 1;
        this.events.trigger("page", {
            pageNumber: value
        })
    }

    set pageCount(count) {
        this._pages = count;
        this._resize(this.data.pages, count, { legend: "Page " + this.data.pages.length, fields: [] })
        this._change();
    }

    get pageCount() {
        return this.data.pages.length;
    }

    _resize(arr, newSize, defaultValue) {
        let hasChanged = false;
        if (newSize < arr.length) {
            // move existing fields 
            for (var i = arr.length - 1; i > newSize - 1; i--) {
                arr[newSize - 1].fields.push(...arr[i].fields);
                hasChanged = true;
            }
        }

        while (newSize > arr.length)
            arr.push(defaultValue);

        arr.length = newSize;

        if (hasChanged)
            this._change();
    }

    get fieldCount() {
        return this._fieldCount;
    }

    get schema() {
        return this.data;
    }

    get mode() {
        if (!this._mode)
            this._mode = "json";

        return this._mode;
    }

    _calculate() {
        this._pageIndex = 0;
        this._fieldCount = 0;
        this.data.pages.forEach(p => {
            p.fields.forEach(f => {
                this._fieldCount++;
            })
        })
    }

    add(fieldSchema) {
        this.schema.pages[this._pageIndex].fields.push(fieldSchema);
        this._fieldCount++;
        this._change();
    }

    createField(type, name, caption, props) {
        return {
            type: type,
            name: name,
            caption: caption,
            ...props || {}
        }
    }
}

export default ExoFormSchemaModel;