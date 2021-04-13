import Core from '../pwa/Core';
import DOM from '../pwa/DOM';
import ExoFormFactory from './ExoFormFactory';

/*!
 * ExoForm - Generic Form/Wizard Generator - using JSON Form Schemas
 * (c) 2021 Marc van Neerven, MIT License, https://cto-as-a-service.nl 
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
            reserved: ["containerClass", "caption", "template", "elm", "ctl", "tagname"]
        },

        templates: {
            empty: /*html*/`<span data-replace="true"></span>`,
            exocontainer: /*html*/`<div class="exf-container"></div>`,
            default: /*html*/`<div data-id="{{id}}" class="exf-ctl-cnt {{class}}"><label title="{{caption}}">{{caption}}</label><span data-replace="true"></span></div>`,
            nolabel: /*html*/`<div data-id="{{id}}" class="exf-ctl-cnt {{class}}"><span data-replace="true"></span></div>`,
            text: /*html*/`<div data-id="{{id}}" class="exf-ctl-cnt exf-base-text {{class}}"><span data-replace="true"></span><label title="{{caption}}">{{caption}}</label></div>`,
            labelcontained: /*html*/`<div data-id="{{id}}" class="exf-ctl-cnt {{class}}"><label title="{{tooltip}}"><span data-replace="true"></span> <span>{{caption}}</span></label></div>`,
            form: /*html*/`<form class="exf-form {{class}}" method="post"></form>`,
            static: /*html*/`<div class="{{class}}" ></div>`,
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
    static version = "0.981";

    defaults = {
        type: "form",
        baseUrl: document.location.origin,
        navigation: "default",
        runtime: {
            progress: false
        },
        form: {
            theme: "fluent",
            class: ""
        },

        multiValueFieldTypes: ["checkboxlist", "tags"],

        ruleMethods: {
            "visible": [Field.show, Field.hide],
            "enabled": [Field.enable, Field.disable],
            "scope": [Page.scope, Page.descope],
            "customMethod": [Field.callCustomMethod, () => { }],
            "goto": [Page.goto, () => { }],
            "dialog": [Dialog.show, () => { }]
        }
    }

    constructor(context, opts) {
        const _ = this;

        Core.addEvents(this); // add simple event system

        // Use const factory = await ExoFormFactory.build() and factory.createForm()"
        if (!context || !(context instanceof ExoFormFactory.Context))
            throw "Invalid instantiation of ExoForm: need ExoFormContext instance";

        _.context = context;

        opts = opts || {};
        const defOptions = {
            type: "form",
            customMethods: {},
        }

        _.options = { ...defOptions, ...opts };

        //NOTE: this is not the loaded formSchema - see load() method.
        _.formSchema = { ..._.defaults } // set defaults
        _.form = DOM.parseHTML(DOM.format(ExoForm.meta.templates[_.options.type], {
            ..._.formSchema.form || { class: "" }
        }));

        _.container = DOM.parseHTML(ExoForm.meta.templates.exocontainer);
    }

    load(schema) {
        const _ = this;

        return new Promise((resolve, reject) => {
            const loader = schema => {
                if (!schema)
                    resolve(_)
                else {

                    _.rawSchema = JSON.stringify(schema, null, 2); // keep original;
                    _.formSchema = { ..._.defaults, ...schema };

                    _.triggerEvent(ExoFormFactory.events.schemaLoaded);

                    _.formSchema.totalFieldCount = _.getTotalFieldCount(_.formSchema)
                    _.applyLoadedSchema();

                    let nav = ExoFormFactory.navigation[_.formSchema.navigation];
                    _.navigation = new nav(_);
                    console.debug("Navigation type:", _.formSchema.navigation, nav.name)

                    resolve(_);
                }
            }
            let isSchema = typeof (schema) == "object";

            if (!isSchema) {
                try {
                    schema = new URL(schema, this.formSchema.baseUrl);

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

    applyLoadedSchema() {
        const _ = this;

        _.formSchema.form = _.formSchema.form || { theme: _.defaults.form.theme };

        let themeClasses = _.formSchema.form.theme ? _.formSchema.form.theme.split(' ') : [_.defaults.form.theme];

        themeClasses.forEach(c => {
            _.container.classList.add(c);
        })

        let formClasses = _.formSchema.form.class ? _.formSchema.form.class.split(' ') : ["standard"];

        formClasses.forEach(c => {
            _.form.classList.add(c);
        })
    }

    triggerEvent(eventName, detail, ev) {
        console.debug("Triggering event", eventName, "detail: ", detail)
        if (!ev) {
            ev = new Event(eventName, { "bubbles": false, "cancelable": false });
        }

        ev.detail = {
            exoForm: this,
            ...(detail || {})
        };

        return this.dispatchEvent(ev);
    }

    getTotalFieldCount(schema) {
        let totalFieldCount = 0;
        if (!schema || !schema.pages || schema.pages.length === 0)
            return 0;

        schema.pages.forEach(p => {
            if (p && p.fields)
                totalFieldCount += p.fields.length;
        })
        return totalFieldCount;
    }

    isPageValid(index) {
        const _ = this;
        let hasInvalid = false;
        try {
            _.runValidCheck = true; // prevent reportValidity() showing messages on controls 
            _.form.querySelectorAll('[data-page="' + index + '"] .exf-ctl-cnt [name]').forEach(f => {
                var isValid = f.reportValidity();
                if (!isValid) {
                    hasInvalid = true;
                }
                if (!hasInvalid) {
                    if (f.required && _.getFieldValue(f) == "") {
                        hasInvalid = true;
                    }
                }
            })
        }
        finally {
            _.runValidCheck = false;
        }
        return !hasInvalid;
    }

    getField(name) {
        return this.findField(f => {
            return f.name === name
        });
    }

    findField(compare) {
        const _ = this;
        let field = null;

        for (var p in _.formSchema.pages) {
            let page = _.formSchema.pages[p];
            field = page.fields.find(compare);
            if (field) {
                break
            }
        }
        return field
    }

    renderForm() {
        const _ = this;

        _.triggerEvent(ExoFormFactory.events.renderStart)
        _.cleanup();

        return new Promise((resolve, reject) => {

            if (!_.formSchema || !_.formSchema.pages || _.formSchema.pages.length == undefined)
                throw "Invalid ExoForm schema";

            _.container.appendChild(_.form);

            _.container.classList.add("exf-ver-" + ExoForm.version);

            try {
                _.renderPages().then(() => {
                    _.finalizeForm();
                    resolve(_);
                }).catch(ex => {
                    reject("renderPages() failed: " + ex.toString());
                });

            }
            catch (ex) {
                reject("Exception in renderPages(): " + ex.toString())
            }
        });
    }

    finalizeForm() {
        const _ = this;
        console.debug("Finalizing form, rendering is ready");

        _.navigation.render();

        _.form.addEventListener("submit", e => {
            e.preventDefault(); // preventing default behaviour
            e.stopPropagation();
            _.submitForm(e);
        });

        // stop propagating events to above form 
        // in case for is embedded in another one (such as ExoFormBuilder)
        _.form.addEventListener("change", e => {
            e.stopPropagation();
        })

        _.checkRules();
        _.updateView(0);
        _.triggerEvent(ExoFormFactory.events.renderReady);


        // Test for fom becoming user-interactive 
        var observer = new IntersectionObserver((entries, observer) => {
            if (_.container.offsetHeight) {
                observer = null;
                console.debug("Form is now interactive");
                _.triggerEvent(ExoFormFactory.events.interactive);
            }

        }, { root: document.documentElement });

        observer.observe(_.container);
    }

    cleanup() {
        this.navigation.clear();

        if (this.container)
            this.container.innerHTML = "";
    }

    on(eventName, func) {
        console.debug("Listening to event", eventName, func);
        this.addEventListener(eventName, func);
        return this;
    }

    renderPages() {
        const _ = this;

        return new Promise((resolve, reject) => {
            var pageNr = 0;
            _.form.setAttribute("data-current-page", pageNr + 1);
            let totalFieldsRendered = 0;

            _.pageContainer = DOM.parseHTML('<div class="exf-wrapper" />');

            _.formSchema.pages.forEach(p => {
                pageNr++;

                p = _.enrichPageSettings(p, pageNr);

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
                                        let cf = _.getFormContainerProps(_)

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

    getFormContainerProps() {
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

    enrichPageSettings(p, pageNr) {
        p.index = pageNr;
        console.debug("Rendering page " + p.index)
        p.isPage = true;
        p.type = p.type || "fieldset";
        p.pagenr = pageNr;
        p.pageid = p.id || "page" + pageNr;
        p.class = "exf-cnt exf-page" + (p.class ? " " + p.class : "");
        p.dummy = DOM.parseHTML('<span/>');
        return p;
    }

    // query all fields using matcher and return matches
    query(matcher){
        let matches = [];
        this.formSchema.pages.forEach(p => {
            p.fields.forEach(f => {
                if(matcher(f)){
                    matches.push(f)
                }
            });
        });
        return matches;
    }

    /*
        Call after load() schema to map field values
    */
    map(mapper) {
        this.formSchema.pages.forEach(p => {
            p.fields.forEach(f => {
                let value = mapper(f);
                if (value !== undefined) {
                    f.value = value;
                    if (f.setCurrentValue) {
                        f.setCurrentValue(f.value);
                    }                    
                    else if (f._control && f._control.htmlElement) {
                        f._control.htmlElement.value = f.value || ""
                    }
                }
            })
        })
        return this;
    }


    showFirstInvalid() {
        const _ = this;

        // find all invalid controls on pages that are in scope (not skipped)
        let allInvalid = _.form.querySelectorAll(".exf-page:not([data-skip='true']) :invalid");
        console.debug("Invalid controls", allInvalid);

        if (allInvalid && allInvalid.length) {
            const f = () => {
                allInvalid[0].focus();
                allInvalid[0].reportValidity();
                DOM.trigger(allInvalid[0], "change");
            };

            if (allInvalid[0].offsetParent === null) { // currently invisible
                let pgElm = allInvalid[0].closest('[data-page]');
                if (pgElm) {
                    let page = parseInt(pgElm.getAttribute("data-page"));
                    _.updateView(0, page);
                    setTimeout(e => f, 20);
                }
            }
            else {
                f();
            }
            return true;
        }
    }

    submitForm(ev) {
        const _ = this;
        if (ev)
            ev.preventDefault();

        if (_.showFirstInvalid())
            return;

        let e = { target: _.form };

        _.getFormValues(ev).then(data => {
            _.triggerEvent(ExoFormFactory.events.post, { postData: data })
            e.returnValue = false;
        })
    }

    getFormValues(e) {
        const _ = this;
        const data = {};
        return new Promise((resolve, reject) => {
            let formData = Object.fromEntries(new FormData(_.form));

            _.formSchema.pages.forEach(p => {
                p.fields.forEach(f => {
                    if (f.getCurrentValue) {
                        data[f.name] = f.getCurrentValue();
                    }
                    else {
                        data[f.name] = formData[f.name];
                        data[f.name] = ExoFormFactory.checkTypeConversion(f.type, data[f.name])
                    }
                })
            });
            console.debug("Form data to post", data);
            resolve(data)
        });
    }

    getFieldValue(f) {
        if (f && f.getCurrentValue)
            return f.getCurrentValue();
        else if (f.name) {
            return DOM.getValue(this.form.querySelector("[name='" + f.name + "']"))
        }
    }



    gotoPage(page) {
        return this.updateView(0, page);
    }

    nextPage() {
        this.updateView(+1);
    }

    previousPage() {
        this.updateView(+1);
    }

    updateView(add, page) {
        const _ = this;

        let current = _.currentPage;

        if(add > 0 && current > 0) {

            if(!this.isPageValid(_.currentPage)){
                
                if (_.showFirstInvalid())
                    return;
            }
        }

        
        page = page || 1;
        if (add !== 0)
            page = parseInt(_.form.getAttribute("data-current-page") || "0");

        page = _.getNextPage(add, page)
        let pageCount = _.getLastPage();

        _.form.setAttribute("data-current-page", page);
        _.form.setAttribute("data-page-count", _.formSchema.pages.length);
        _.currentPage = page;

        let i = 0;
        _.form.querySelectorAll('.exf-page[data-page]').forEach(p => {
            i++;
            p.classList[i === page ? "add" : "remove"]("active");
        });

        _.navigation.update();

        _.triggerEvent(ExoFormFactory.events.page, {
            from: current,
            page: page,
            pageCount: pageCount
        });

        return page;
    }

    getNextPage(add, page) {
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
            nextPage = _.getNextPage(+1, pageNr);
            if (nextPage) {
                lastPage = nextPage;
                pageNr = nextPage;
            }

        } while (nextPage)

        return lastPage || pageNr || 1;
    }

    focusFirstControl() {
        const _ = this;
        var first = _.form.querySelector(".exf-page.active .exf-ctl-cnt");

        if (first && first.offsetParent !== null) {
            first.closest(".exf-page").scrollIntoView();
            setTimeout(e => {
                let ctl = first.querySelector("[name]");
                if (ctl && ctl.offsetParent) ctl.focus();
            }, 20);
        }
    }

    async renderSingleControl(f) {
        const _ = this;
        let c = await this.createControl(f);
        f._control = c;
        let element = await f._control.render();
        if (!element)
            throw ExoFormFactory.fieldToString(f) + " does not render an HTML element";

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

                f.id = f.id || Core.guid();

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

                control.htmlElement.appendChild(DOM.parseHTML(DOM.format('<span class="exf-error exf-create-error" title="{{title}}">ERROR</span>', {
                    title: "Error creating " + ExoFormFactory.fieldToString(f) + ": " + ex.toString()
                })));
                

                doResolve(f, control);
                
                

            }
        });
    }

    testValidity(e, field) {
        if (this.runValidCheck)
            e.preventDefault();
    }

    checkRules() {
        const _ = this;

        if (_.options.type !== "form")
            return;


        _.formSchema.pages.forEach(p => {

            if (Array.isArray(p.rules)) {

                console.debug("Checking page rules", p);

                p.rules.forEach(r => {
                    if (Array.isArray(r.expression)) {

                        _.interpretRule("page", p, r);
                    }
                })
            }

            p.fields.forEach(f => {
                if (Array.isArray(f.rules)) {
                    console.debug("Checking field rules", f);

                    f.rules.forEach(r => {
                        if (Array.isArray(r.expression)) {
                            _.interpretRule("field", f, r);
                        }
                    })
                }
            });
        });
    }

    getRenderedControl(id) {
        return this.form.querySelector('[data-id="' + id + '"]')
    }

    getFieldFromElementId(id) {
        var e = this.getRenderedControl(id), field = null;
        return ExoFormFactory.getFieldFromElement(e);
    }

    // Interpret rules like "msg_about,change,value,!,''"
    interpretRule(objType, f, rule) {
        const _ = this;

        let obj = ExoFormFactory.fieldToString(f)

        console.debug("Running rule on " + obj + " -> [", rule.expression.join(', ') + "]");


        if (rule.expression.length === 5) {

            let method = _.formSchema.ruleMethods[rule.type];
            if (method) {
                let dependencyField = _.getRenderedControl(rule.expression[0]);

                if (dependencyField) {
                    let dependencyControl = dependencyField.querySelector("[name]");
                    if (!dependencyControl) dependencyControl = dependencyField;
                    if (!dependencyControl) {
                        console.error("Dependency control for rule on '" + obj + "' not found");
                    }
                    else {
                        console.debug("Dependency control for rule on '" + obj + "': ", dependencyControl.name);

                        const func = (e) => {
                            console.debug("Event '" + rule.expression[1] + "' fired on ", DOM.elementPath(e));

                            let ruleArgs = rule.expression.slice(2, 5);
                            let expressionMatched = _.testRule(f, dependencyControl, ...ruleArgs);
                            console.debug("Rule", ruleArgs, "matched: ", expressionMatched);

                            let index = expressionMatched ? 0 : 1;

                            const rf = method[index];
                            console.debug("Applying rule", rule.expression[1], obj);
                            rf.apply(f._control.htmlElement, [{
                                event: e,
                                field: f,
                                exoForm: _,
                                rule: rule,
                                dependency: dependencyControl
                            }])

                            let host = _.getEventHost(dependencyControl);

                            _.setupEventEventListener({
                                field: f,
                                host: host,
                                rule: rule,
                                eventType: rule.expression[1],
                                method: func
                            })
                        }
                        func({ target: dependencyControl });
                    };
                }
                else {
                    console.warn("Dependency field for", f, "not found with id '" + rule.expression[0] + "'");
                }
            }
            else {
                console.error("Rule method for rule type", rule.type, "on field", f);
            }
        }
    }

    setupEventEventListener(settings) {
        const _ = this;

        if (settings.eventType === "livechange") {
            settings.eventType = "input";
        }

        console.debug("Setting up event listener of type '" + settings.eventType + "' on ", DOM.elementToString(settings.host));
        settings.host.addEventListener(settings.eventType, settings.method);
    }

    getEventHost(ctl) {
        let eh = ctl.closest('[data-evtarget="true"]');
        return eh || ctl;
    }

    testRule(f, control, value, compare, rawValue) {
        var t = undefined;
        let v = this.getFieldValue(control);
        try {
            t = eval(rawValue);
        }
        catch (ex) {
            console.error("Error evaluating rule control value for ", control, compare, v, rawValue);
            throw "Error evaluating " + rawValue;
        }
        console.debug("Value of '" + control.name + "' =", v);
        return Core.compare(compare, v, t)
    }

    clear() {
        this.form.reset();
        this.form.querySelectorAll(".clearable").forEach(c => {
            c.innerHTML = "";
        });

    }
}

class Field {
    static show(obj) {
        DOM.show(obj.field._control.container);
    }
    static hide(obj) {
        DOM.hide(obj.field._control.container);
    }
    static enable(obj) {
        DOM.enable(obj.field._control.htmlElement);
    }
    static disable(obj) {
        DOM.disable(obj.field._control.htmlElement);
    }
    static callCustomMethod(obj) {
        if (!obj || !obj.exoForm)
            throw "Invalid invocation of callCustomMethod";

        let method = obj.rule.method;
        if (method) {
            let f = obj.exoForm.options.customMethods[method];
            f.apply(obj.exoForm, [obj])
        }
    }
}

class Page {
    static scope(obj) {
        obj.field._control.container.removeAttribute("data-skip");
    }
    static descope(obj) {
        obj.field._control.container.setAttribute("data-skip", "true");
    }

    static goto(obj) {
        return obj.exoForm.gotoPage(obj.rule.page);
    }
}

//TODO
class Dialog {
    static show(obj) {
        debugger;
    }
}

export default ExoForm;

