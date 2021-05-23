/*!
 * ExoForm - Generic Form/Wizard Generator - using JSON Form Schemas
 * (c) 2021 Marc van Neerven, MIT License, https://cto-as-a-service.nl 
*/

import Core from '../../pwa/Core';
import DOM from '../../pwa/DOM';
import ExoFormFactory from './ExoFormFactory';
import ExoFormDataBinding from '../databinding/ExoFormDataBinding';

/**
 * ExoForm class. 
 * Created using ExoFormContext create() method
 * 
 * @hideconstructor
 */
class ExoForm {

    static meta = {

        properties: {
            all: ["accept", "alt", "autocomplete", "autofocus", "capture", "checked", "dirName", "disabled", "height", "list",
                "max", "maxLength", "min", "minLength", "multiple", "name", "pattern", "placeholder", "readOnly", "required",
                "size", "src", "step", "type", "value", "width", "className"],
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
        this.events = new Core.Events(this);

        // Use const context = await ExoFormFactory.build() and context.createForm()
        if (!context || !(context instanceof ExoFormFactory.Context))
            throw "ExoForm: invalid instantiation of ExoForm: need ExoFormContext instance";

        this.context = context;

        opts = opts || {};
        const defOptions = {
            type: "form",
            customMethods: {},
        }
        this.options = { ...defOptions, ...opts };
        this.form = document.createElement("form");
        this.form.setAttribute("method", "post");
        this.form.classList.add("exf-form");
        this.container = DOM.parseHTML(ExoForm.meta.templates.exocontainer);
    }

    get schema() {
        return this._schema;
    }

    /**
     * load ExoForm schema (string or )
     * @param {any} schema - A JSON ExoForm Schema string or object, or URL to fetch it from.
     * @return {Promise} - A Promise returning the ExoForm Object with the loaded schema
     */
    load(schema, options) {
        options = options || { mode: "async" };
        const _ = this;

        if (options.mode.startsWith("sync")) {
            return this.loadSchema(schema);
        }

        return new Promise((resolve, reject) => {
            const loader = schema => {
                if (!schema)
                    resolve(_)
                else {
                    this.loadSchema(schema);
                    resolve(_);
                }
            }

            if (Core.isUrl(schema)) {
                let url = new URL(schema, this.context.baseUrl);

                try {
                    if (url.toString().split(".").pop() === "js") {

                        const settings =  {
                            // credentials: 'include',
                            // headers: {
                            //     'Content-Type': 'text/plain',
                            //     'Accept': 'text/plain'
                            // }
                        };
                        
                        fetch(url, settings).then(x => {
                            if (x.status === 200) {
                                return x.text()
                            }
                            throw "HTTP Status " + x.status;
                        }).then(r => {
                            loader(r);
                        }).catch(ex => {
                            reject(ex);
                        });
                    }
                    else {
                        let settings = {
                            //credentials: 'include',
                            // headers1: {
                            //     'Content-Type': 'application/json',
                            //     'Accept': 'application/json'
                            // }
                        };

                        fetch(url, settings).then(x => {
                            if (x.status === 200) {
                                return x.json()
                            }
                            throw "HTTP Status " + x.status;
                        }).then(r => {
                            loader(r);
                        }).catch(ex => {
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
    loadSchema(schema) {

        this._schema = this.context.createSchema();
        this._schema.parse(schema);

        this._dataBinding = new ExoFormDataBinding(this, this._mappedInstance);
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

        this._createComponents();

        if (this.schema.form) {
            let formClasses = this.schema.form.class ? this.schema.form.class.split(' ') : ["standard"];
            formClasses.forEach(c => {
                this.form.classList.add(c);
            })
        }
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
            let tp = cmp.type.getType(this);
            console.debug("ExoForm:", n, "component used:", tp.name);
            this.addins[n] = new tp(this)
        }
    }

    /**
     * Render ExoForm schema into a form
     * Returns a Promise
     */
    renderForm() {
        const _ = this;

        _.events.trigger(ExoFormFactory.events.renderStart)
        _._cleanup();

        return new Promise((resolve, reject) => {

            _.container.appendChild(_.form);

            try {
                _._renderPages().then(() => {
                    _._finalizeForm().then(()=>{
                        resolve(_);
                    });
                    
                }).catch(ex => {
                    reject("_renderPages() failed: " + ex.toString());
                });

            }
            catch (ex) {
                reject("Exception in _renderPages(): " + ex.toString())
            }
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

        this.events.trigger(ExoFormFactory.events.renderReady);

        // Test for fom becoming user-interactive 
        var observer = new IntersectionObserver((entries, observer) => {
            if (this.container.offsetHeight) {
                observer = null;
                console.debug("ExoForm: interactive event");
                this.events.trigger(ExoFormFactory.events.interactive);
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

                    p.fields.forEach(f => {
                        console.debug("ExoForm: rendering field", f.name, f);
                        f.dummy = DOM.parseHTML('<span/>');

                        page.appendChild(f.dummy);
                        _.createControl(f).then(() => {

                            f._control.render().then(rendered => {

                                if (!rendered)
                                    throw "ExoForm: " + ExoFormFactory.fieldToString(f) + " does not render an HTML element";

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
                        }).catch(ex => {
                            reject("Exception in createControl() for control " + ExoFormFactory.fieldToString(f) + ": " + ex.toString())
                        });
                    });

                }).catch(ex => {
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
                if (!f || !f.type)
                    throw "ExoForm: incorrect field options. Must be object with at least 'type' property. " + JSON.stringify(f)

                f.id = f.id || _._generateUniqueElementId();

                let field = _.context.get(f.type);
                if (!field)
                    throw "ExoForm: " + f.type + " is not a registered ExoForm field type";

                let baseType = field.type;

                if (!baseType)
                    throw "ExoForm: class for " + f.type + " not defined";

                if (!_.context.isExoFormControl(f))
                    throw "ExoForm: cannot create control: class for " + f.type + " is not derived from ExoControlBase";

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
        let gid = Core.guid();
        gid = gid.split('-');
        gid = gid[gid.length - 1];
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