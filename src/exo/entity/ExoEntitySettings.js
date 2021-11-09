import Core from '../../pwa/Core';
import OpenApi from './OpenApi';

class ExoEntitySettings {

    constructor(options) {
        if (!options)
            throw TypeError("Missing options");

        if (!options.dataSchema)
            throw TypeError("Missing dataSchema");

        this.events = new Core.Events(this);
        this.options = {
            ...this._defaults,
            ...options
        };
    }


    static events = {
        stateChange: "stateChange",
        initializing: "initializing",
        initialized: "initialized",
        busy: "busy",
        ready: "ready"
    }

    _state = -1;

    static states = {
        initializing: 0,
        initialized: 1,
        ready: 2
    }

    static get baseEditFormSchema() {
        return {
            navigation: "static",
            model: {
                schemas: {
                    data: undefined
                },
                instance: {
                    data: {},
                } 
            }
        }
        
    }

    options = {
        filter: ""
    }


    _defaults = {
        forms: {
            list: {
                control: {
                    name: "grid",
                    type: "listview",
                    pageSize: 8,
                    views: ["grid", "tiles"],      
                    items: this._getDataAsync.bind(this),
                    mappings: {},
                    contextMenu: {
                        direction: "left",
                        items: [
                            {
                                tooltip: "Edit",
                                icon: "ti-pencil",
                                action: "edit",
                            },
                            {
                                tooltip: "Delete",
                                icon: "ti-close",
                                action: "delete",
                            },
                        ],

                    },
                    listen: {
                        ready: (e) => {
                            if (this.options.search) {
                                e.detail.host.filterListView(this.options.search);
                            }
                        },
                    },

                    controls: [
                        {
                            type: "search",
                            name: "filter",
                            caption: "Filter...",
                            placeholder: "Type to filter...",
                            listener: "input",
                            //class: "exf-listview-flt",
                            value: this.options.filter || "",
                        },
                        {
                            type: "button",
                            name: "del",
                            icon: "ti-close",
                            caption: "",
                            tooltip: "Delete selected",
                            useSelection: true,
                        },
                        {
                            type: "button",
                            name: "add",
                            class: "btn-primary",
                            icon: "ti-plus",
                            caption: "",
                            tooltip: "Add item",
                        },
                        {
                            type: "button",
                            name: "view",
                            icon: "ti-layout-grid3",
                            caption: "",
                            tooltip: "Switch view",
                        },
                        {
                            type: "button",
                            name: "toggle",
                            icon: "ti-check-box",
                            dropdown: [
                                {
                                    icon: "ti-check-box",
                                    caption: "Select all",
                                    action: "select"

                                },
                                {
                                    icon: "ti-layout-width-full",
                                    caption: "Deselect all",
                                    action: "deselect"
                                },
                            ],
                        },
                    ],

                    properties: []
                }
            },
            edit: {
                schema: ExoEntitySettings.baseEditFormSchema
            }
        }
    }

    get forms() {
        return {
            list: {
                schema: {
                    model: {
                        instance: {
                            data: {},
                        },
                        logic: (context) => {
                            const m = context.model;
                            //m.bindings.noSelection = true;
                            this.model = m;
                        },
                    },
                    navigation: "none",
                    pages: [
                        {
                            legend: "",
                            intro: "",
                            fields: [
                                this.options.forms.list.control
                            ]
                        },
                    ],
                }
            },
            edit: {}
        }
    }

    get api(){
        return this.options.api;
    }

    async readMetaData() {
        this.state = ExoEntitySettings.states.initializing;

        try {
            this.busy = true;
            let acquire = async () => {
                return await this.acquireMetaData(this.options.dataSchema);
            }

            let cache = new Core.SimpleCache(acquire, 1000 * 3600)

            const meta = await cache.get();

            switch (meta.type) {

                case "openapi":
                    this.openApi = new OpenApi(meta.data, {
                        dto: this.options.dto
                    });
                    await this.openApi.read();
                    this.jsonSchema = this.openApi.jsonSchema;
                    this.options.api = this.openApi.api;
                    break;

                case "jsonschema":
                    this.jsonSchema = meta.data;// xo.form.factory.readMetaData(meta.data);
                    break;

                default:
                    throw TypeError("Unknown metadata");
            }

            if (!this.jsonSchema || !this.jsonSchema.properties)
                throw TypeError("JSON Schema not available");

            this.options.forms.edit.schema.model.schemas.data = this.jsonSchema; // set same jsonschema in generated editor model

            
            this.options.forms.list.control = {
                ...this.options.forms.list.control,
                properties: this.distilListProperties(this.jsonSchema),
            }



            this.state = ExoEntitySettings.states.initialized

        }
        finally {
            this.busy = false;
        }
    }

    async acquireMetaData(source) {
        let data = await Core.acquireState(source);//  Core.isUrl(source) ? await fetch(source).then(x => x.json()) : source;

        let type = parseInt(data.openapi) >= 3 ? "openapi" : data.$schema != null ? "jsonschema" : "unknown";

        return {
            type: type,
            data: data
        }
    }

    get state() {
        return this._state;
    }

    set state(value) {
        if (value != this._state) {

            this._state = value;
            this.events.trigger(ExoEntitySettings.events.stateChange);

            switch (this.state) {
                case ExoEntitySettings.states.initializing:
                    this.events.trigger(ExoEntitySettings.events.initializing);
                    break;
                case ExoEntitySettings.states.initialized:
                    this.events.trigger(ExoEntitySettings.events.initialized);
                    break;
                case ExoEntitySettings.states.ready:
                    this.events.trigger(ExoEntitySettings.events.ready);
                    break;
            }

        }
    }

    _getDataAsync() {
        return new Promise((resolve) => {
            this.busy = true;
            this.options.api
                .get()
                .then((data) => {
                    resolve(data);
                })
                .finally(() => {
                    setTimeout(() => {
                        this.busy = false;
                    }, 100);
                });
        });
    }

    distilListProperties(schema) {
        const properties = [];
        Object.keys(schema.properties).forEach((key) => {
            const prop = schema.properties[key];
            properties.push({
                key,
                type: prop.type,
                name: prop.title,
            });
        });
        return properties;
    }

    set busy(value) {
        this._busy = value == true;
        
        this.events.trigger(this._busy ? ExoEntitySettings.events.busy : ExoEntitySettings.events.ready);
    }

    get busy() {
        return this._busy
    }

    _generateEditorFormSchema(data) {
        
        const schema = {
            ...JSON.parse(JSON.stringify(this.editSchemaBase)),
        }

        schema.model.instance.data = data;
        return schema;
    }

    // create mappings for listview if needed
    tryFixMissingListViewMappings() {
        const l = this.options.forms.list;

        if (this.options.forms.list.control.type === "listview") {
            let fieldName = this.getListviewNamePropertyFuzzy();
            this.options.forms.list.control.views.forEach(v => {
                let mappings = l.control.mappings[v];
                if (!mappings) {
                    l.control.mappings[v] = [{ key: fieldName }]
                }
            })
        }
    }

    // simplistic check for obvious properties to use when none are specified
    getListviewNamePropertyFuzzy() {
        const props = this.jsonSchema.properties;
        for (var p in props) {
            let s = (props[p].title || p).toLowerCase();
            if (["name", "title", "naam", "file"].includes(s)) {
                return p;
            }
        }

        return this.getFirstStringProperty()
    }

    getFirstStringProperty() {
        let first = null;
        const props = this.jsonSchema.properties;
        for (var p in props) {
            if (!first) first = p;
            if (props[p].type === "string") {
                return p;
            }
        }

        return first;
    }

    // if mapped.list.control.properties are returned by map(),
    // it's an object structure with key: {prop1: value1, prop2: value2}
    // while the listview works with an array of properties
    reApplyListViewProperties(mapped) {
        let ar = this.options.forms.list.control.properties;
        if (Array.isArray(ar)) {
            let ar1 = [];
            if (mapped?.list?.control) {
                let obj = mapped.list.control.properties;
                if (typeof (obj) === "object") {

                    ar.forEach(p => {
                        let item = p;
                        if (obj[p.key]) {
                            item = {
                                ...p,
                                ...obj[p.key]
                            }
                        }
                        ar1.push(item);
                    });
                }
            }
            mapped.list.control.properties = ar1;
        }
    }

    async init() {
        if (this.state < ExoEntitySettings.states.initialized) {
            await this.readMetaData();
            try {

                let mapped = this.options.uiSchema ? await Core.acquireState(this.options.uiSchema) || {} : {}
                Core.deepMerge(this.options.forms, mapped);

                this.reApplyListViewProperties(this.options.forms) // object struct to array

                this.tryFixMissingListViewMappings();
            }
            catch (ex) {
                console.error("checkLoaded", ex);
            }
            finally {
                this.state = ExoEntitySettings.states.initialized;

                // store default edit schema
                this.editSchemaBase = {
                    ...this.options.forms.edit.schema,
                    mappings: this.options.forms.edit.mappings
                }

                this.state = ExoEntitySettings.states.ready;
            }
        }
    }
}

export default ExoEntitySettings;