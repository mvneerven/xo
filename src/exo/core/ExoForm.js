import Core from '../../pwa/Core';
import DOM from '../../pwa/DOM';
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
            exocontainer: /*html*/`<div class="exf-container"></div>`,
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

        this.id = this.options.id || Core.guid();
        this.events = new Core.Events(this);

        this.form = document.createElement("form");
        this.form.setAttribute("method", "post");
        this.form.classList.add("exf-form");
        this.container = DOM.parseHTML(ExoForm.meta.templates.exocontainer);
        this.container.setAttribute("data-id", this.id);

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
                    // .catch(ex => {
                    //     reject(ex)
                    // });
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


        console.debug("Model loaded", this.dataBinding.model)

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
        this.schema.refreshStats();

        this._loadAddins();

        if (this.schema.form) {
            let formClasses = this.schema.form.class ? this.schema.form.class.split(' ') : ["standard"];
            formClasses.forEach(c => {
                this.form.classList.add(c);
            })
        }

        this.schema.refreshStats();
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

    // bind(instance) {
    //     //TODO
    //     this._mappedInstance = instance;
    // }

    _loadAddins() {
        this._state = "Loading addins";
        this.addins = {};
        for (var n in ExoFormFactory.meta) {
            let cmp = ExoFormFactory.meta[n];

            let obj = cmp.type.getType(this);
            if (!obj || !obj.type)
                throw TypeError("Addin not found: '" + n + "'")


            this.addins[n] = new obj.type(this);

            this.container.classList.add(`exf-${n}-${obj.name}`);

        }

        console.debug("Registered addins:", this.addins);

    }

    toString() {

        return `${this.schema.summary}`;
    }

    /**
     * Render ExoForm schema into a form
     * Returns a Promise
     */
    renderForm() {

        this._state = "Start rendering";

        if (this.schema.data.dirty) {
            this.addDirtyCheck();
        }

        this.events.trigger(ExoFormFactory.events.renderStart)
        this._cleanup();

        return new Promise((resolve, reject) => {
            this.container.appendChild(this.form);
            if (this.schema.id) {
                this.container.setAttribute("id", this.schema.id);
            }
            this._renderPages().then(() => {
                this._finalizeForm().then(() => {
                    resolve(this);
                });
            })
        });
    }

    addDirtyCheck() {
        window.onbeforeunload = e => {
            const allDirty = this.form.querySelectorAll(".exf-dirty");

            if (allDirty.length === 0)
                return;

            return "Are you sure?";
        }

        document.addEventListener('visibilitychange', function () {
            console.debug("ExoForm: visible: ", document.visibilityState);
        });
    }

    async _finalizeForm() {

        this._state = "Finalizing";

        await this.addins.navigation.render();

        this.addins.progress.render();

        this.addins.theme.apply();

        this.form.addEventListener("submit", e => {
            e.preventDefault(); // preventing default behaviour
            e.stopPropagation();
            this.submitForm(e);
        });

        // stop propagating events to above form 
        // in case for is embedded in another one (such as ExoFormBuilder)
        this.form.addEventListener("change", e => {
            e.stopPropagation();
        })

        this.addins.rules.checkRules(this.context, this.options);

        this.addins.navigation.restart();

        this.events.trigger(ExoFormFactory.events.renderReady);

        // Test for fom becoming user-interactive 
        var observer = new IntersectionObserver((entries, observer) => {
            if (this.container.offsetHeight) {
                observer = null;
                if (!this.events.triggeredInteractive) {
                    this.events.trigger(ExoFormFactory.events.interactive);
                    this.events.triggeredInteractive = true;
                }
            }

        }, { root: document.documentElement });

        observer.observe(this.container);
    }

    _cleanup() {
        if (this.addins && this.addins.navigation)
            this.addins.navigation.clear();

        if (this.container)
            this.container.innerHTML = "";
    }

    _renderPages() {
        const me = this;
        this._state = "Rendering";

        return new Promise((resolve, reject) => {
            var pageNr = 0;

            let totalFieldsRendered = 0;

            me.pageContainer = DOM.parseHTML('<div class="exf-wrapper" />');

            me.schema.pages.forEach(p => {
                pageNr++;

                p = me._enrichPageSettings(p, pageNr);

                me.pageContainer.appendChild(p.dummy);

                me.createControl(p).then(page => {
                    let pageFieldsRendered = 0;

                    if (Array.isArray(p.fields)) {
                        p.fields.forEach(f => {
                            f.dummy = DOM.parseHTML('<span/>');

                            page.appendChild(f.dummy);
                            me.createControl(f).then(() => {
                                f._control.render().then(rendered => {
                                    pageFieldsRendered = this._addRendered(f, rendered, pageFieldsRendered, p, page);

                                })
                                    .finally(r => {
                                        totalFieldsRendered++;
                                        if (totalFieldsRendered === me.schema.fieldCount) {
                                            me.container.classList.add(pageNr > 1 ? "exf-multi-page" : "exf-single-page");
                                            me.form.appendChild(me.pageContainer);
                                            resolve();
                                        }
                                    });
                            })
                        });
                    }
                    else {
                        console.warn(`Page ${pageNr} has no fields array`);
                    }
                })
            });
        });
    }

    _addRendered(f, rendered, pageFieldsRendered, p, page) {
        DOM.replace(f.dummy, rendered);
        delete f.dummy;
        pageFieldsRendered++;
        if (pageFieldsRendered === p.fields.length) {
            page.render().then(pageElm => {
                DOM.replace(p.dummy, pageElm);
                delete p.dummy;
            });
        }
        return pageFieldsRendered;
    }

    _getFormContainerProps() {
        let p = {
            type: "div",
            class: "exf-wrapper",
            ...this.schema.form.container,
            ...{
                pages: this.schema.pages?.length ? this.schema.pages.map(y => {
                    return {
                        id: "page" + y.id,
                        caption: y.legend
                    }
                }) : []
            }
        }
        return p;
    }

    _enrichPageSettings(p, pageNr) {
        p.index = pageNr;
        p.isPage = true;
        p.type = p.type || "fieldset";
        p.class = "exf-cnt exf-page" + (p.class ? " " + p.class : "");
        p.dummy = document.createElement('span');
        return p;
    }

    /**
     * query all fields using matcher and return matches
     * @param {function} matcher - function to use to filter
     * @param {object} options - query options. e.g. {inScope: true} for querying only fields that are currenttly in scope.
     * @return {array} - All matched fields in the current ExoForm schema
     */
    query(matcher, options) {
        if (matcher === undefined) matcher = () => { return true };
        options = options || {};

        const match = (item, data) => {

            if (data.type === "page") {
                return !options.inScope || this.isPageInScope(data.pageIndex)
            }
            return matcher(item, data)
        }

        return this.schema.query(match, options);
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
     * Get field with given name
     * @param {string} name - name of field to get
     * @return {Object} - Field
     */
    get(name) {
        let results = this.query(f => {
            return f.name === name;
        });
        return results.length ? results[0] : null;
    }

    /**
     * Map data to form, once schema is loaded
     * @param {function} mapper - a function that will return a value per field
     * @return {object} - the current ExoForm instance
     */
    map(mapper) {

        this.query().forEach(f => {
            let value = mapper(f);
            if (value !== undefined) {
                f.value = value;
                f._control.value = value;
            }
        });

        return this;
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
        this.query().forEach(f => {
            if (f._control) {
                data[f.name] = f._control.value;
            }
        })
        return Core.clone(data);
    }

    getFieldValue(elementOrField) {
        if (elementOrField && elementOrField._control)
            return elementOrField._control.value;
        else if (elementOrField.form && elementOrField.name) {

            let field = ExoFormFactory.getFieldFromElement(elementOrField);
            if (field)
                return field._control.value; //return DOM.getValue(this.form.querySelector("[name='" + f.name + "']"))
        }
        return undefined;
    }

    /**
     * Renders a single ExoForm control 
     * @param {object} field - field structure sub-schema. 
     * @return {promise} - A promise with the typed rendered element
     */
    async renderSingleControl(field) {
        const _ = this;
        let c = await this.createControl(field);
        field._control = c;
        let element = await c.render();
        if (!element)
            throw ExoFormFactory.fieldToString(field) + " does not render an HTML element";

        return element;
    }

    createControl(f) {
        const me = this;
        return new Promise((resolve, reject) => {

            const doResolve = (f, c) => {
                f._control = c;

                c.htmlElement.data = c.htmlElement.data || {}; c.htmlElement.data.field = f; // keep field in element data
                c.htmlElement.setAttribute("data-exf", "1"); // mark as element holding data
                resolve(c);
            }


            if (!f.type) {
                if (f.bind) {
                    f.type = this._getDefaultControlType(f.bind);
                }
                else
                    f.type = "text";
            }

            f.id = f.id || me._generateUniqueElementId();

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

            if (f.custom) {
                ExoFormFactory.loadCustomControl(f, f.custom).then(x => {
                    let customType = x.default;
                    control = new customType(context);
                    doResolve(f, control);
                })
            }
            else {
                control = new baseType(context);
                doResolve(f, control);
            }
        });
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


    _generateUniqueElementId() {
        let gid = 'xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return "exf" + gid;
    }

    clear() {
        this.form.reset();
        this.form.querySelectorAll(".clearable").forEach(c => {
            c.innerHTML = "";
        });

    }
}

export default ExoForm;
