import Core from '../../pwa/Core';
import ExoFormFactory from './ExoFormFactory';
import ExoFormDataBinding from '../databinding/ExoFormDataBinding';

/**
 * XO form class. 
 * Created using ExoFormContext create() method
 * 
 * @hideconstructor
 */
class ExoForm {
    _cssVariables = {};

    static meta = {

        properties: {
            map: {
                "class": "className",
                "readonly": "readOnly",
                "dirname": "dirName",
                "minlength": "minLength",
                "maxlength": "maxLength"
            },
            reserved: ["template", "elm", "ctl", "tagname", "ispage", "bind"]
        },

        templates: {
            empty: /*html*/`<span data-replace="true"></span>`,
            legend: /*html*/`<legend class="exf-page-title">{{legend}}</legend>`,
            pageIntro: /*html*/`<p class="exf-page-intro">{{intro}}</p>`,
            datalist: /*html*/`<datalist id="{{id}}"></datalist>`,
            datalistItem: /*html*/`<option label="{{label}}" value="{{value}}" >`,
            button: /*html*/`<button name="{{name}}" type="{{type}}" class="btn {{class}}">{{caption}}</button>`,
        }
    }

    static _staticConstructor = (() => { ExoForm.setup() })();
    static setup() { } // reserved for later  

    constructor(context, opts) {
        this._state = "Loading";
        if (!context || !(context instanceof ExoFormFactory.Context))
            throw TypeError("ExoForm: invalid instantiation of ExoForm: need ExoFormContext instance");

        this.context = context;

        opts = opts || {};
        const defOptions = {
            type: "form",
            customMethods: {},
            DOMChange: context.config.defaults.DOMChange || "input"
        }
        this.options = {
            ...defOptions,
            ...context.config.runOptions || {},
            ...opts
        };

        this.id = this.options.id || Core.guid({ compact: true, prefix: "frm" });

        this.events = new Core.Events(this);

        xo.events.trigger("new-form", {
            id: this.id,
            exoForm: this
        })
    }

    get state() {
        return this._state;
    }

    /**
     * Returns the current Form Schema
     */
    get schema() {
        return this._schema;
    }

    /**
     * load XO form schema (string or )
     * @param {any} schema - A JSON/JS XO form Schema string or object, or URL to fetch it from.
     * @return {Promise} - A Promise returning the XO form Object with the loaded schema
     */
    load(schema, options) {

        this._state = "Loading schema";

        options = options || { mode: "async" };

        return new Promise((resolve, reject) => {
            const loader = schema => {
                if (!schema)
                    resolve(this)
                else {

                    this.loadSchema(schema).then(() => {

                        this.schema.applyJsonSchemas();
                        this.events.trigger(ExoFormFactory.events.jsonSchemasApplied);
                        resolve(this);
                    })
                }
            }

            if (Core.isUrl(schema)) {

                let url = new URL(schema, this.context.baseUrl);
                const settings = {};
                try {
                    if (url.toString().split(".").pop() === "js") {
                        fetch(url, settings).then(x => {
                            if (x.status === 200) {
                                return x.text()
                            }
                            throw TypeError("HTTP Status " + x.status);
                        }).then(r => {
                            loader(r);
                        })
                    }
                    else {
                        fetch(url, settings).then(x => {
                            if (x.status === 200) {
                                return x.json()
                            }
                            throw TypeError("HTTP Status " + x.status);
                        }).then(r => {
                            loader(r);
                        });
                    }
                }
                catch (ex) {
                    reject(ex);
                }
            }
            else {
                loader(schema);
            }
        });


    }

    /**
     * load XO form schema from object
     * @param {any} schema - A JSON/JS XO form Schema object.
     * @return {any} - the loaded schema
     */
    async loadSchema(schema) {
        this.events.trigger(ExoFormFactory.events.created);
        this._schema = this.context.createSchema();
        this.schema.parse(schema);
       
        this.events.trigger(ExoFormFactory.events.schemaParsed);
        
        await this.resolveJsonSchemas()
        this.schema.createDefaultUiIfNeeded();
        this.events.trigger(ExoFormFactory.events.schemaLoading);
        
        this._dataBinding = new ExoFormDataBinding(this);
        await this._dataBinding.prepare();

        this.dataBinding.on("change", e => {
            e.detail.state = "change";
            this.events.trigger(ExoFormFactory.events.dataModelChange, e.detail)        
        }).on("ready", e => {
            e.detail.state = "ready";
            this.events.trigger(ExoFormFactory.events.dataModelChange, e.detail)

        }).on("error", e => {
            this.events.trigger(ExoFormFactory.events.error, e.detail);
        });
        
        this.events.trigger(ExoFormFactory.events.schemaLoaded);
    }

    // resolve 
    async resolveJsonSchemas() {
        this._state = "Resolving JSON schemas";

        let promises = [];
        const loadJsonSchema = async (url, instanceName) => {
            let schemaUrl = new URL(url, this.context.baseUrl);
            return await fetch(schemaUrl).then(x => {
                if (x.status === 200) {
                    return x.json()
                }
                throw `HTTP Status ${x.status} - ${schemaUrl.toString()}`;
            }).then(data => {
                this._schema.addJSONSchema(instanceName, data);
            })
        }

        return new Promise((resolve, reject) => {
            if (this.schema.model?.schemas) {
                for (var instanceName in this.schema.model.schemas) {
                    let schemaRef = this.schema.model.schemas[instanceName]
                    if (Core.isUrl(schemaRef)) {
                        promises.push(loadJsonSchema(schemaRef, instanceName))
                    }
                    else {

                        this._schema.addJSONSchema(instanceName, schemaRef);
                    }
                }
            }

            if (promises.length === 0) {
                resolve()
            }
            else {
                Promise.all(promises).then(x => {
                    resolve();
                })
            }
        });
    }

    /**
    * Gets the data binding object
    * @return {object} - The ExoFormDataBinding instance associated with the form.
    */
    get dataBinding() {
        return this._dataBinding;
    }

    toString() {
        return `${this.schema.summary}`;
    }

    /**
     * Render ExoForm schema into a form
     * Returns a Promise
     */
    async renderForm() {
        this._state = "Start rendering";

        this.events.trigger(ExoFormFactory.events.renderStart)

        const fieldSchema = {
            ...this.schema._schemaData,
            type: "formcontainer"
        }

        this.root = this.createControl(fieldSchema); // root control


        await this.root.render();

        this.container = this.root.container;

        return this;
    }

    get addins() {
        return this.root?.addins;
    }

    get form() {
        return this.root?.htmlElement;
    }

    get container() {
        return this.root?.container;
    }

    set container(value) {
        // NA
    }

    /**
     * Returns true if the given page is in scope (not descoped by active rules)
     * @param {object} p - Page object (with index numeric property)
     * @returns {boolean} - true if page is in scope
     */
    isPageInScope(index) {
        let pageElm = this.form.querySelector(".exf-page[data-page='" + index + "']:not([data-skip='true'])");
        return pageElm !== null;
    }

    /**
     * Get control with given name or from element
     * @param {string} data - name of field to get, or HTML element
     * @return {Object} - Control
     */
    get(data) {
        const type = typeof (data);
        if (type !== "string")
            throw TypeError("The data argument must be a string");

        return this.root._getControlByName(data);

        // else if (type === "object") {
        //     let elm = data.closest("[data-exf]")
        //     return this.controlDict[elm]
        // }
    }

    all() {
        return this.root.all();
    }

    /**
     * Submits the form
     * @param {event} ev - event object to pass onto the submit handler
     */
    submitForm(ev) {
        if (ev)
            ev.preventDefault();

        if (!this.addins.validation.checkValidity()) {
            this.addins.validation.reportValidity();
            return;
        }

        let e = { target: this.form };

        let data = this.getFormValues(ev);
        let detail = { postData: data };
        let result = this.events.trigger(ExoFormFactory.events.beforePost, detail)
        if (result) {
            this.prePost().then(result => {
                if (result) {
                    data._prePostResult = result;
                }
                this.events.trigger(ExoFormFactory.events.post, { postData: data })
            });

            e.returnValue = false;
        }
    }

    async prePost() {
    }

    /**
     * Gets the current form's values
     * @return {object} - The typed data posted
     */
    getFormValues() {
        const data = {};

        this.root.all().forEach(control => {
            if (control.hasValue)
                data[control.name] = control.value;
        })
        return Core.clone(data);
    }

    /**
     * Renders a single ExoForm control 
     * @param {object} field - field structure sub-schema. 
     * @return {promise} - A promise with the typed rendered element
     */
    async renderSingleControl(field) {
        let c = await this.createControl(field, null);

        let element = await c.render();
        if (!element)
            throw ExoFormFactory.fieldToString(field) + " does not render an HTML element";

        return element;
    }

    createControl(f, parentControl) {
        const me = this;

        if (!f.type) {
            if (f.bind) {
                f.type = this._getDefaultControlType(f.bind);
            }
            else
                f.type = "text";
        }

        f.id = f.id || Core.guid({ compact: true, prefix: "exf" });

        let field = me.context.get(f.type);
        if (!field)
            throw TypeError(f.type + " is not a registered ExoForm field type");

        let baseType = field.type;

        if (!baseType)
            throw TypeError("Class for " + f.type + " not defined");

        if (!me.context.isExoFormControl(f))
            throw TypeError("Cannot create control: class for " + f.type + " is not derived from ExoControlBase");

        let control = null;

        let context = {
            exo: me,
            field: f
        };

        control = new baseType(context, parentControl);

        control.mapAcceptedProperties();
        return control;
    }

    _getDefaultControlType(bind) {
        try {
            let result = this.dataBinding.get(bind);
            switch (typeof (result)) {
                case "boolean": return "checkbox";
                case "number": return "number";
            }
            return "text"
        }
        catch {
            return "text"
        }
    }

    clear() {
        this.form.reset();
        this.form.querySelectorAll(".clearable").forEach(c => {
            c.innerHTML = "";
        });
    }

    /**
     * Shortcut to instance in databinding models
     * @param {*} name 
     * @returns {Object}
     */
    getInstance(name) {
        const obj = this.dataBinding?.model?.instance[name];
        if (typeof (obj) === "object")
            return Core.clone(obj);
        throw TypeError("Instance not found")
    }
}

export default ExoForm;
