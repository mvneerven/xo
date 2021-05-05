/*!
 * ExoForm - Generic Form/Wizard Generator - using JSON Form Schemas
 * (c) 2021 Marc van Neerven, MIT License, https://cto-as-a-service.nl 
*/

import Core from '../pwa/Core';
import DOM from '../pwa/DOM';
import ExoFormFactory from './ExoFormFactory';
import ExoFormModel from './ExoFormModel';
import ExoFormBindingResolver from './ExoFormBindingResolver';

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
            reserved: ["caption", "template", "elm", "ctl", "tagname"]
        },

        templates: {
            empty: /*html*/`<span data-replace="true"></span>`,
            exocontainer: /*html*/`<div class="exf-container"></div>`,
            fieldset: /*html*/`<fieldset data-page="{{pagenr}}" data-pageid="{{pageid}}" class="exf-cnt {{class}}"></fieldset>`,
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
        Core.addEvents(this); // add simple event system

        // Use const context = await ExoFormFactory.build() and context.createForm()
        if (!context || !(context instanceof ExoFormFactory.Context))
            throw "Invalid instantiation of ExoForm: need ExoFormContext instance";

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

    /**
     * load ExoForm schema 
     * @param {any} schema - A JSON ExoForm Schema object or a URL to fetch it from.
     * @return {Promise} - A Promise
     */
    load(schema) {
        const _ = this;

        return new Promise((resolve, reject) => {
            const loader = schema => {
                if (!schema)
                    resolve(_)
                else {
                    _.formSchema = {
                        //..._.defaults,
                        ..._.context.config.defaults || {},
                        ...schema
                    };

                    this.dataModel = new ExoFormModel(this, this._mappedInstance);
                    this.dataModel.on("change", e => {
                        e.detail.state = "change";
                        this.triggerEvent(ExoFormFactory.events.dataModelChange, e.detail)
                    }).on("ready", e => {
                        e.detail.state = "ready";
                        this.triggerEvent(ExoFormFactory.events.dataModelChange, e.detail)
                    });

                    _.triggerEvent(ExoFormFactory.events.schemaLoaded);
                    _.formSchema.totalFieldCount = _.query().length;
                    _._createComponents();
                    _._applyLoadedSchema();
                    resolve(_);
                }
            }
            let isSchema = typeof (schema) == "object";

            if (!isSchema) {

                if (Core.isUrl(schema)) {
                    schema = new URL(schema, this.context.baseUrl);
                }
                else {
                    reject("The schema parameter is not an ExoForm schema object nor a valid URL.");
                }

                try {
                    fetch(schema).then(x => x.json()).then(r => {
                        loader(r);
                    }).catch(ex => {
                        reject(ex);
                    });
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

    bind(instance) {
        this._mappedInstance = instance;
    }

    _createComponents() {
        this.addins = {};
        for (var n in ExoFormFactory.meta) {
            let cmp = ExoFormFactory.meta[n];
            let tp = cmp.type.getType(this);
            this.addins[n] = new tp(this)
        }
    }

    _applyLoadedSchema() {
        this.formSchema.form = this.formSchema.form || {};
        let formClasses = this.formSchema.form.class ? this.formSchema.form.class.split(' ') : ["standard"];
        formClasses.forEach(c => {
            this.form.classList.add(c);
        })
    }

    triggerEvent(eventName, detail, ev) {
        console.debug("Triggering event", eventName, "detail: ", detail)
        if (!ev) {
            ev = new Event(eventName, { bubbles: false, cancelable: true });
        }

        ev.detail = {
            exoForm: this,
            ...(detail || {})
        };

        return this.dispatchEvent(ev);
    }

    /**
     * Render ExoForm schema into a form
     * Returns a Promise
     */
    renderForm() {
        const _ = this;

        _.triggerEvent(ExoFormFactory.events.renderStart)
        _._cleanup();

        return new Promise((resolve, reject) => {

            if (!_.formSchema || !_.formSchema.pages || _.formSchema.pages.length == undefined)
                throw "Invalid ExoForm schema";

            _.container.appendChild(_.form);

            try {
                _._renderPages().then(() => {
                    _._finalizeForm();
                    resolve(_);
                }).catch(ex => {
                    reject("_renderPages() failed: " + ex.toString());
                });

            }
            catch (ex) {
                reject("Exception in _renderPages(): " + ex.toString())
            }
        });
    }

    _finalizeForm() {
        console.debug("Finalizing form, rendering is ready");

        this.addins.navigation.render();

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

        this._updateView(0);
        this.triggerEvent(ExoFormFactory.events.renderReady);
        this._listenFormModelChanges();

        // Test for fom becoming user-interactive 
        var observer = new IntersectionObserver((entries, observer) => {
            if (this.container.offsetHeight) {
                observer = null;
                console.debug("Form is now interactive");
                this.triggerEvent(ExoFormFactory.events.interactive);
            }

        }, { root: document.documentElement });

        observer.observe(this.container);
    }

    _listenFormModelChanges() {
        const resolver = new ExoFormBindingResolver(this);

        this.on(ExoFormFactory.events.dataModelChange, e => {
            resolver.resolve();
        })

        resolver.resolve();
    }

    _cleanup() {
        this.addins.navigation.clear();

        if (this.container)
            this.container.innerHTML = "";
    }

    /**
    * Adds an event handler
    * @param {string} eventName - Name of the event to listen to - Use xo.form.factory.events as a reference
    * @param {function} func - function to attach 
    * @return {object} - The ExoForm instance
    */
    on(eventName, func) {
        console.debug("Listening to event", eventName, func);
        this.addEventListener(eventName, func);
        return this;
    }

    _renderPages() {
        const _ = this;

        return new Promise((resolve, reject) => {
            var pageNr = 0;
            _.form.setAttribute("data-current-page", pageNr + 1);
            let totalFieldsRendered = 0;

            _.pageContainer = DOM.parseHTML('<div class="exf-wrapper" />');

            _.formSchema.pages.forEach(p => {
                pageNr++;

                p = _._enrichPageSettings(p, pageNr);

                _.pageContainer.appendChild(p.dummy);

                _.createControl(p).then(page => {
                    let pageFieldsRendered = 0;

                    p.fields.forEach(f => {
                        console.debug("Rendering field", f.name, f);
                        f.dummy = DOM.parseHTML('<span/>');

                        page.appendChild(f.dummy);
                        _.createControl(f).then(() => {

                            f._control.render().then(rendered => {

                                if (!rendered)
                                    throw ExoFormFactory.fieldToString(f) + " does not render an HTML element";

                                pageFieldsRendered = this._addRendered(f, rendered, pageFieldsRendered, p, page);

                            }).catch(ex => {
                                let showError = !this.triggerEvent(ExoFormFactory.events.error, { error: ex });
                                console.error(ex);
                                let rendered = DOM.parseHTML(DOM.format('<span class="exf-error exf-render-error" title="{{title}}">ERROR</span>', {
                                    title: "Error rendering field " + ExoFormFactory.fieldToString(f) + ": " + ex.toString()

                                }))
                                pageFieldsRendered = this._addRendered(f, rendered, pageFieldsRendered, p, page);

                            }).finally(r => {
                                totalFieldsRendered++;

                                if (totalFieldsRendered === _.formSchema.totalFieldCount) {
                                    _.container.classList.add(pageNr > 1 ? "exf-multi-page" : "exf-single-page");

                                    // check for custom container
                                    if (_.formSchema.form.container) {
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

            console.debug("Page " + p.pagenr + " rendered with " + pageFieldsRendered + " controls");

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
            ...this.formSchema.form.container,
            ...{
                pages: this.formSchema.pages && this.formSchema.pages.length ? this.formSchema.pages.map(y => {
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
        console.debug("Rendering page " + p.index)
        p.isPage = true;
        p.type = p.type || "fieldset";
        p.pagenr = pageNr;
        p.pageid = p.id || "page" + pageNr;
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
        let matches = [];

        if (!this.formSchema || !this.formSchema.pages || !Array.isArray(this.formSchema.pages))
            return matches;

        this.formSchema.pages.forEach(p => {
            if (!options.inScope || this.isPageInScope(p)) {
                let fieldIndex = 0
                if (Array.isArray(p.fields)) {
                    p.fields.forEach(f => {
                        f._page = {
                            index: p.index,
                            legend: p.legend
                        }
                        f._index = fieldIndex;

                        if (matcher(f)) {
                            matches.push(f)
                        }

                        fieldIndex++;
                    });
                }
            }
        });
        return matches;
    }

    /**
     * Returns true if the given page is in scope (not descoped by active rules)
     * @param {object} p - Page object (with index numeric property)
     * @returns {boolean} - true if page is in scope
     */
    isPageInScope(p) {
        let pageElm = this.form.querySelector(".exf-page[data-page='" + p.index + "']:not([data-skip='true'])");
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
        const _ = this;
        if (ev)
            ev.preventDefault();

        if (!_.addins.validation.checkValidity()) {
            console.debug("checkValidity - Form not valid");
            _.addins.validation.reportValidity();
            return;
        }

        let e = { target: _.form };

        let data = _.getFormValues(ev);
        _.triggerEvent(ExoFormFactory.events.post, { postData: data })
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
     * Moves to the given page in a multi-page form.
     */
    gotoPage(page) {
        return this._updateView(0, page);
    }

    /**
     * Moves to the next page in a multi-page form.
     */
    nextPage() {
        this._updateView(+1);
    }

    /**
     * Moves to the previous page in a multi-page form.
     */
    previousPage() {
        this._updateView(-1);
    }

    _updateView(add, page) {
        const _ = this;

        let current = _.currentPage;

        if (add > 0 && current > 0) {

            if (!this.addins.validation.isPageValid(_.currentPage)) {
                this.addins.validation.reportValidity(_.currentPage);
                return;
            }
        }

        page = page || 1;
        if (add !== 0)
            page = parseInt(_.form.getAttribute("data-current-page") || "0");

        page = _._getNextPage(add, page)
        let pageCount = _.getLastPage();

        if (current > 0) {
            if (!_.addins.navigation.canMove(current, page))
                return;

            let returnValue = _.triggerEvent(ExoFormFactory.events.beforePage, {
                from: current,
                page: page,
                pageCount: pageCount
            });

            if (returnValue === false)
                return;
        }

        _.form.setAttribute("data-current-page", page);
        _.form.setAttribute("data-page-count", _.formSchema.pages.length);
        _.currentPage = page;

        let i = 0;
        _.form.querySelectorAll('.exf-page[data-page]').forEach(p => {
            i++;
            p.classList[i === page ? "add" : "remove"]("active");
        });

        _.addins.navigation.update();

        _.triggerEvent(ExoFormFactory.events.page, {
            from: current,
            page: page,
            pageCount: pageCount
        });

        return page;
    }

    _getNextPage(add, page) {
        const _ = this;
        let ok = false;

        var skip;
        do {
            page += add;

            if (page > _.formSchema.pages.length) {
                return undefined;
            };

            let pgElm = _.form.querySelector('.exf-page[data-page="' + page + '"]');
            if (pgElm) {
                skip = pgElm.getAttribute("data-skip") === "true";

                console.debug("Wizard Page " + page + " currently " + (skip ? "OUT OF" : "in") + " scope");
                if (!skip) {
                    ok = true;
                }
            }
            else {
                ok = true;
                return undefined;
            }

            if (add === 0)
                break;

        } while (!ok)

        if (page < 1) page = 1;

        return page;
    }

    getLastPage() {
        const _ = this;
        let pageNr = parseInt(_.form.getAttribute("data-current-page"));
        let lastPage = 0;
        let nextPage = -1;
        do {
            nextPage = _._getNextPage(+1, pageNr);
            if (nextPage) {
                lastPage = nextPage;
                pageNr = nextPage;
            }

        } while (nextPage)

        return lastPage || pageNr || 1;
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
                // keep field in element data
                c.htmlElement.data = c.htmlElement.data || {};
                c.htmlElement.data.field = f;
                c.htmlElement.setAttribute("data-exf", "1"); // mark as element holding data
                console.debug("Resolving ", ExoFormFactory.fieldToString(f));
                resolve(c);
            }

            try {
                if (!f || !f.type)
                    throw "Incorrect field options. Must be object with at least 'type' property. " + JSON.stringify(f)

                f.id = f.id || _._generateUniqueElementId();

                let field = _.context.get(f.type);
                if (!field)
                    throw f.type + " is not a registered ExoForm field type";

                let baseType = field.type;

                if (!baseType)
                    throw "Class for " + f.type + " not defined";

                if (!_.context.isExoFormControl(f))
                    throw "Cannot create control: class for " + f.type + " is not derived from ExoControlBase";

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

                //reject("Error in createControl(): " + ex.toString())
                let field = _.context.get("div");
                let control = new field.type({
                    exo: _,
                    field: {
                        ...f
                    }
                });

                let showError = !_.triggerEvent(ExoFormFactory.events.error, {
                    stage: "Create",
                    error: ex
                });

                console.error(ex);
                control.htmlElement.appendChild(DOM.parseHTML(DOM.format('<span class="exf-error exf-create-error" title="{{title}}">ERROR</span>', {
                    title: "Error creating " + ExoFormFactory.fieldToString(f) + ": " + ex.toString()
                })));
                //if(!showError)
                //    control.container.classList.add("exf-hidden")

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
