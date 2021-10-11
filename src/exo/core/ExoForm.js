/*!
 * ExoForm - Generic Form/Wizard Generator - using JSON Form Schemas
 * (c) 2021 Marc van Neerven, MIT License, https://cto-as-a-service.nl 
*/

import Core from '../../pwa/Core';
import DOM from '../../pwa/DOM';
import ExoFormFactory from './ExoFormFactory';
import ExoFormDataBinding from '../databinding/ExoFormDataBinding';
import xo from '../../../js/xo';

/**
 * ExoForm class. 
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
        if (!context || !(context instanceof ExoFormFactory.Context))
            throw TypeError("ExoForm: invalid instantiation of ExoForm: need ExoFormContext instance");

        this.context = context;

        opts = opts || {};
        const defOptions = {
            type: "form",
            customMethods: {},
            DOMChange: context.config.defaults.DOMChange || "input"
        }
        this.options = { ...defOptions, ...opts };

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

    /**
     * Returns the current Form Schema
     */
    get schema() {
        return this._schema;
    }

    /**
     * Returns a reference to the CSS variables included 
     */
    get cssVariables() {        
        return this._cssVariables;
    }

    renderStyleSheet() {
        const id = `form-variables-${this.id}`,
        prevStyleSheet = document.getElementById(id);
        if (prevStyleSheet) prevStyleSheet.remove();

        const cssSheet = document.createElement("style");
        cssSheet.id = id;
        const css = Object.keys(this.cssVariables).map(
            (c) => `${c}: ${this.cssVariables[c]};`
        );
        cssSheet.innerHTML = `[data-id="${this.id}"] { ${css.join(
            " "
        )} }`;
        document.querySelector("head").appendChild(cssSheet);
    }

    /**
     * load ExoForm schema (string or )
     * @param {any} schema - A JSON ExoForm Schema string or object, or URL to fetch it from.
     * @return {Promise} - A Promise returning the ExoForm Object with the loaded schema
     */
    load(schema, options) {
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
                    }).catch(ex => {
                        reject(ex)
                    });
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
                        }).catch(ex => {
                            this.events.trigger(ExoFormFactory.events.error, {
                                error: ex,
                                message: `Error loading schema from ${url}: ${ex.toString()}`
                            });
                            reject(ex);
                        });
                    }
                    else {
                        fetch(url, settings).then(x => {
                            if (x.status === 200) {
                                return x.json()
                            }
                            throw TypeError("HTTP Status " + x.status);
                        }).then(r => {
                            loader(r);
                        }).catch(ex => {
                            this.events.trigger(ExoFormFactory.events.error, {
                                error: ex,
                                message: `Error loading schema from ${url}: ${ex.toString()}`
                            });
                            reject(ex);
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
     * load ExoForm schema from object
     * @param {any} schema - A JSON ExoForm Schema object.
     * @return {any} - the loaded schema
     */
    async loadSchema(schema) {

        this.events.trigger(ExoFormFactory.events.created);


        return new Promise((resolve, reject) => {
            this._schema = this.context.createSchema();
            this.schema.parse(schema);

            this.events.trigger(ExoFormFactory.events.schemaParsed);

            this.resolveJsonSchemas().then(() => {

                this.schema.createDefaultUiIfNeeded();

                this.events.trigger(ExoFormFactory.events.schemaLoading);

                this._dataBinding = new ExoFormDataBinding(this, this._mappedInstance);
                this._dataBinding.prepare().then(() => {

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

                    this._createComponents();

                    if (this.schema.form) {
                        let formClasses = this.schema.form.class ? this.schema.form.class.split(' ') : ["standard"];
                        formClasses.forEach(c => {
                            this.form.classList.add(c);
                        })
                    }

                    resolve();
                })

            })
            this.schema.refreshStats();
        });
    }

    // resolve 
    async resolveJsonSchemas() {

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
            if (this.schema.model && this.schema.model.schemas) {
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

    bind(instance) {
        //TODO
        this._mappedInstance = instance;
    }

    _createComponents() {
        this.addins = {};
        for (var n in ExoFormFactory.meta) {
            let cmp = ExoFormFactory.meta[n];

            let obj = cmp.type.getType(this);
            if (!obj || !obj.type)
                throw TypeError("Addin not found: '" + n + "'")

            console.debug("ExoForm addin:", n, "type:", obj.name, "component used:", obj.type.name);

            this.addins[n] = new obj.type(this);

            this.container.classList.add(`exf-${n}-${obj.name}`);

        }
    }

    toString() {

        return `${this.schema.summary}`;
    }

    /**
     * Render ExoForm schema into a form
     * Returns a Promise
     */
    renderForm() {

        if (this.schema.data.dirty) {
            this.addDirtyCheck();
        }

        this.events.trigger(ExoFormFactory.events.renderStart)
        this._cleanup();

        return new Promise((resolve, reject) => {

            this.container.appendChild(this.form);
            if (this.schema.form.id) {
                this.container.setAttribute("id", this.schema.form.id);
            }

            try {

                this._renderPages().then(() => {

                    this._finalizeForm().then(() => {

                        resolve(this);
                    });

                })

                    .catch(ex => {
                        reject("_renderPages() failed: " + ex.toString());
                    });

            }
            catch (ex) {
                reject("Exception in _renderPages(): " + ex.toString())
            }
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

        // TODO reimplement rules using model binding
        this.addins.rules.checkRules();

        this.addins.navigation.restart();

        this.renderStyleSheet();

        this.events.trigger(ExoFormFactory.events.renderReady);

        // Test for fom becoming user-interactive 
        var observer = new IntersectionObserver((entries, observer) => {
            if (this.container.offsetHeight) {
                observer = null;
                console.debug("ExoForm: interactive event");
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
        const _ = this;

        let cid = this.container.id;

        return new Promise((resolve, reject) => {
            var pageNr = 0;

            let totalFieldsRendered = 0;

            _.pageContainer = DOM.parseHTML('<div class="exf-wrapper" />');

            _.schema.pages.forEach(p => {
                pageNr++;

                p = _._enrichPageSettings(p, pageNr);

                _.pageContainer.appendChild(p.dummy);

                _.createControl(p).then(page => {
                    let pageFieldsRendered = 0;

                    if (Array.isArray(p.fields)) {
                        p.fields.forEach(f => {
                            console.debug("ExoForm: rendering field", f.name, f, cid);
                            f.dummy = DOM.parseHTML('<span/>');

                            page.appendChild(f.dummy);
                            _.createControl(f).then(() => {
                                console.debug("createControl ", f, " on " + cid);

                                f._control.render().then(rendered => {

                                    if (!rendered)
                                        throw TypeError("ExoForm: " + ExoFormFactory.fieldToString(f) + " does not render an HTML element");

                                    pageFieldsRendered = this._addRendered(f, rendered, pageFieldsRendered, p, page);

                                }).catch(ex => {
                                    let showError = !this.events.trigger(ExoFormFactory.events.error, { error: ex });
                                    console.error(ex);
                                    let rendered = DOM.parseHTML(DOM.format('<span class="exf-error exf-render-error" title="{{title}}">ERROR</span>', {
                                        title: "ExoForm: error rendering field " + ExoFormFactory.fieldToString(f) + ": " + ex.toString()

                                    }))
                                    pageFieldsRendered = this._addRendered(f, rendered, pageFieldsRendered, p, page);

                                }).finally(r => {

                                    totalFieldsRendered++;

                                    if (totalFieldsRendered === _.schema.fieldCount) {
                                        _.container.classList.add(pageNr > 1 ? "exf-multi-page" : "exf-single-page");

                                        // check for custom container
                                        if (_.schema.form.container) {
                                            let cf = _._getFormContainerProps(_)

                                            _.createControl(cf).then(cx => {
                                                cx.render().then(x => {
                                                    x.appendChild(_.pageContainer);
                                                    _.pageContainer = DOM.unwrap(_.pageContainer);
                                                    cx.finalize(_.pageContainer);
                                                    _.form.appendChild(x);

                                                    resolve();
                                                })
                                            });

                                        }
                                        else {
                                            _.form.appendChild(_.pageContainer);
                                            resolve();
                                        }

                                    }
                                });
                            })

                                .catch(ex => {
                                    reject("Exception in createControl() for control " + ExoFormFactory.fieldToString(f) + ": " + ex.toString())
                                });
                        });
                    }
                    else {
                        console.warn(`Page ${pageNr} has no fields array`);
                    }
                })

                    .catch(ex => {
                        reject("Exception in createControl() for page container " + ExoFormFactory.fieldToString(p) + ": " + ex.toString())
                    });
            });
        });
    }

    _addRendered(f, rendered, pageFieldsRendered, p, page) {
        DOM.replace(f.dummy, rendered);
        delete f.dummy;
        pageFieldsRendered++;
        if (pageFieldsRendered === p.fields.length) {

            console.debug("ExoForm: page", p.index + "rendered with", pageFieldsRendered, " controls");

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
                pages: this.schema.pages && this.schema.pages.length ? this.schema.pages.map(y => {
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
            console.debug("ExoForm - checkValidity - Form not valid");
            this.addins.validation.reportValidity();
            return;
        }

        let e = { target: this.form };

        let data = this.getFormValues(ev);
        this.events.trigger(ExoFormFactory.events.post, { postData: data })
        e.returnValue = false;
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
        return data;
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
        const _ = this;
        return new Promise((resolve, reject) => {

            const doResolve = (f, c) => {
                f._control = c;

                c.htmlElement.data = c.htmlElement.data || {}; c.htmlElement.data.field = f; // keep field in element data
                c.htmlElement.setAttribute("data-exf", "1"); // mark as element holding data
                console.debug("ExoForm: resolving ", ExoFormFactory.fieldToString(f));
                resolve(c);
            }

            try {

                //this.schema.applyJsonSchema(f);


                if (!f.type)
                    throw TypeError("ExoForm: incorrect field options. Must be object with at least 'type' property. " + JSON.stringify(f))

                f.id = f.id || _._generateUniqueElementId();

                let field = _.context.get(f.type);
                if (!field)
                    throw TypeError("ExoForm: " + f.type + " is not a registered ExoForm field type");

                let baseType = field.type;

                if (!baseType)
                    throw TypeError("ExoForm: class for " + f.type + " not defined");

                if (!_.context.isExoFormControl(f))
                    throw TypeError("ExoForm: cannot create control: class for " + f.type + " is not derived from ExoControlBase");

                let control = null;

                let context = {
                    exo: _,
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

            }
            catch (ex) {
                let field = _.context.get("div");
                let control = new field.type({
                    exo: _,
                    field: {
                        ...f
                    }
                });

                let showError = !_.events.trigger(ExoFormFactory.events.error, {
                    stage: "Create",
                    error: ex
                });

                console.error(ex);
                control.htmlElement.appendChild(DOM.parseHTML(DOM.format('<span class="exf-error exf-create-error" title="{{title}}">ERROR</span>', {
                    title: "Error creating " + ExoFormFactory.fieldToString(f) + ": " + ex.toString()
                })));

                doResolve(f, control);
            }
        });
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
