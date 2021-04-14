import ExoForm from './ExoForm';
import DOM from '../pwa/DOM';
import ExoBaseControls from './ExoBaseControls';
import ExoExtendedControls from './ExoExtendedControls';
import ExoDevControls from './ExoDevControls';
import ExoChartControls from './ExoChartControls';
import ExoSchemaGenerator from './ExoSchemaGenerator';
import ExoThemes from './ExoThemes';

//#region Navigation Classes
class ExoFormNavigationBase {

    buttons = {};

    constructor(exo) {
        this.exo = exo;
        this._visible = true;
    }

    get visible() {
        return this._visible;
    }

    set visible(value) {
        this._visible = value;
        let cnt = this.exo.form.querySelector(".exf-nav-cnt");
        if (cnt) DOM[this._visible ? "show" : "hide"]();
    }

    clear() {
        let cnt = this.exo.form.querySelector(".exf-nav-cnt");
        if (cnt) cnt.remove();
    }

    render() {
        const tpl = /*html*/`<fieldset class="exf-cnt exf-nav-cnt"></fieldset>`;
        this.container = DOM.parseHTML(tpl);

        for (var b in this.buttons) {
            this.addButton(b, this.buttons[b])
        }

        this.exo.form.appendChild(this.container);
    }

    addButton(name, options) {
        options = {
            class: "",
            type: "button",
            caption: name,
            name: name,
            ...options || {}
        }

        const tpl = /*html*/`<button name="{{name}}" type="{{type}}" class="btn {{class}}">{{caption}}</button>`;

        let btn = DOM.parseHTML(DOM.format(tpl, options));
        this.buttons[name].element = btn;

        this.container.appendChild(btn);
    }

    update() { }
}

class ExoFormNoNavigation extends ExoFormNavigationBase {

    next() {
        this.exo.updateView(+1);
    }

    back() {
        this.exo.updateView(-1);
    }

    restart() {
        this.exo.updateView(0, 1);
    }

}

class ExoFormDefaultNavigation extends ExoFormNoNavigation {

    buttons = {
        "send": {
            caption: "Submit",
            class: "form-post"
        }
    }

    render() {
        const _ = this;
        super.render();

        this.buttons["send"].element.addEventListener("click", e => {
            e.preventDefault();
            _.exo.submitForm();
        })
    }
}

class ExoFormWizardNavigation extends ExoFormDefaultNavigation {

    buttons = {

        prev: {
            "caption": "Back",
            "class": "form-prev"
        },
        next: {
            "caption": "Next ↵",
            "class": "form-next"
        },
        send: {
            caption: "Submit",
            class: "form-post"
        }
    };

    render() {
        const _ = this;
        super.render();

        this.buttons["prev"].element.addEventListener("click", e => {
            e.preventDefault();
            _.back()
        })

        this.buttons["next"].element.addEventListener("click", e => {
            e.preventDefault();
            _.next()
        })

        _.exo.on(ExoFormFactory.events.page, e => {
            let page = e.detail.page;
            let pageCount = e.detail.pageCount;

            DOM[page === 1 ? "disable" : "enable"](_.buttons["prev"].element);
            DOM[page === pageCount ? "disable" : "enable"](_.buttons["next"].element);
        })
    }


}

class ExoFormSurveyNavigation extends ExoFormWizardNavigation {

    render() {
        const _ = this;
        super.render();

        const check = e => {
            let exf = e.target.closest("[data-exf]");
            if (exf && exf.data && exf.data.field) {
                _.checkForward(exf.data.field, "change", e)
            }
        };

        _.exo.form.querySelector(".exf-wrapper").addEventListener("change", check);

        _.exo.form.addEventListener("keydown", e => {
            if (e.keyCode === 8) { // backspace - TODO: Fix 
                if ((e.target.value === "" && (!e.target.selectionStart) || e.target.selectionStart === 0)) {
                    _.exo.updateView(-1);
                    e.preventDefault();
                    e.returnValue = false;
                }
            }
            else if (e.keyCode === 13) { // enter
                if (e.target.type !== "textarea") {
                    var isValid = _.exo.form.reportValidity ? _.exo.form.reportValidity() : true;
                    if (isValid) {
                        let exf = e.target.closest("[data-exf]");
                        if (exf && exf.data && exf.data.field) {
                            _.checkForward(exf.data.field, "enter", e);
                            e.preventDefault();
                            e.returnValue = false;
                        }
                    }
                }
            }
        });

        _.exo.on(ExoFormFactory.events.page, e => {
            _.exo.focusFirstControl();
        })

        let container = _.exo.form.closest(".exf-container");
        
        container.classList.add("exf-survey");

        _.exo.on(ExoFormFactory.events.interactive, e => {
            _.exo.form.style.height = container.offsetHeight + "px";
            _.exo.form.querySelectorAll(".exf-page").forEach(p => {
                p.style.height = container.offsetHeight + "px";
            })
        })
    }

    checkForward(f, eventName, e) {
        const _ = this.exo;

        if (!_.container) {
            return;
        }

        _.container.classList.remove("end-reached");
        _.container.classList.remove("step-ready");



        var isValid = f._control.htmlElement.reportValidity ? f._control.htmlElement.reportValidity() : true;
        if (isValid || !_.formSchema.multiValueFieldTypes.includes(f.type)) {
            if (_.currentPage == _.getLastPage()) {

                _.container.classList.add("end-reached");

                _.form.appendChild(
                    _.container.querySelector(".exf-nav-cnt")
                );
            }
            else {

                // special case: detail.field included - workaround 
                let type = f.type;
                if (e.detail && e.detail.field)
                    type = e.detail.field;

                if (!["checkboxlist", "tags"].includes(type)) { // need metadata from controls
                    _.updateView(+1);
                }

                else {
                    _.container.classList.add("step-ready");
                }

                f._control.container.appendChild(
                    _.container.querySelector(".exf-nav-cnt")
                );

            }
        }

    }
}

class WizardProgress {
    container = null;

    templates = {
        progressbar: /*html*/`
            <nav class="exf-wiz-step-cnt">
                <div class="step-wizard" role="navigation">
                <div class="progress">
                    <div class="progressbar empty"></div>
                    <div class="progressbar prog-pct"></div>
                </div>
                <ul>
                    {{inner}}
                </ul>
                </div>
                
            </nav>`,
        progressstep: /*html*/`
            <li class="">
                <button type="button" id="step{{step}}">
                    <div class="step">{{step}}</div>
                    <div class="title">{{pagetitle}}</div>
                </button>
            </li>`
    }

    constructor(generator) {
        this.generator = generator;
    }

    render() {
        const _ = this;

        _.container = DOM.parseHTML(_.templates.progressbar.replace("{{inner}}", ""));
        _.ul = _.container.querySelector("ul");

        let nr = 0;
        _.generator.formSchema.pages.forEach(p => {
            nr++;
            _.ul.appendChild(DOM.parseHTML(DOM.format(this.templates.progressstep, {
                step: nr,
                pagetitle: p.legend
            })));
        });

        _.container.querySelectorAll(".step-wizard ul button").forEach(b => {
            b.addEventListener("click", e => {
                var step = parseInt(b.querySelector("div.step").innerText);
                _.generator.updateView(0, step);
            })
        });

        return this.container;
    }

    setClasses() {
        const _ = this;

        let index = _.generator.currentPage;
        let steps = _.generator.getLastPage();

        if (!_.container)
            return;

        if (index < 0 || index > steps) return;

        var p = (index - 1) * (100 / steps);

        let pgb = _.container.querySelector(".progressbar.prog-pct");
        if (pgb)
            pgb.style.width = p + "%";

        var ix = 0;
        _.container.querySelectorAll("ul li").forEach(li => {
            ix++;
            li.classList[ix === index ? "add" : "remove"]("active");

            li.classList[_.generator.isPageValid(ix) ? "add" : "remove"]("done");

        });

        _.container.querySelectorAll(".exf-wiz-step-cnt .step-wizard li").forEach(li => {
            li.style.width = (100 / (steps + 1)) + "%";
        })

    }
}

//#endregion 

class ExoFormContext {
    constructor(library) {
        this.library = this.enrichMeta(library)

        this.themes = ExoThemes

        this._theme = this.themes.fluent; // default theme
    }

    enrichMeta(library){
        const form = this.createForm();
        form.load({ pages: [{}] });
        
        for (var name in library) {
            let field = library[name];
            let context = {
                exo: form,
                field: {
                    name: name,
                    type: name
                }
            };
            let control = name !== "base" ? new field.type(context) : { acceptedProperties: [] };
            field.returns = field.returnValueType ? field.returnValueType.name : "None";
            field.element = control.htmlElement ? control.htmlElement.tagName.toLowerCase() : "none";
            field.properties = this.getProps(field, field.type, control);
            field._key = name;
        }
         
        return library;
    }

    getProps(field, type, control) {
        let ar = {};

        if(field.returnValueType){
            ar.name = {
                type: "string",
                description: "Name of the field. Determines posted value key"
            }
            ar.required = {
                type: "boolean",
                description: "Makes the field required. The form cannot be posted when the user has not entered a value in thisn field."
            }
    
        }
        
        ar.caption = {
            type: "string",
            description: "Caption text. Normally shown in a label element within the field container"
        }

        if (control && control.acceptedProperties.length) {
            control.acceptedProperties.forEach(p => {
                let name = p;
                if (typeof (p) === "object") {
                    name = p.name
                }
                delete p.name;
                p.type = p.type || String;
                p.type = p.type.name;

                ar[name] = p;
            })
        }
        return ar
    }

    createForm(options) {
        // the only place where an 
        // ExoForm instance can be created
        return new ExoForm(this, options)
    }

    get(type) {
        return this.library[type]
    }

    query(callback) {

        for (var name in this.library) {
            var field = this.library[name];
            if (callback.apply(this, [field]))
                return field;
        }
    }

    isExoFormControl(formSchemaField) {
        let field = this.get(formSchemaField.type);

        return (field.type.prototype instanceof ExoFormFactory.library.base.type)
    }

    renderSingleControl(field) {
        return this.createForm().renderSingleControl(field);
    }

    createGenerator() {
        return new ExoSchemaGenerator();
    }

    get theme(){
        return this._theme;
    }

    set theme(value){
        if(this.themes[value]){
            this._theme = this.themes[value];
        }
        else{
            throw "Theme not registered"
        }
    }

}

// ExoForm Factory - imports libraries and provides factory methods 
// for creating forms.
class ExoFormFactory {

    static _ev_pfx = "exf-ev-";

    static events = {
        page: ExoFormFactory._ev_pfx + "page",
        getListItem: ExoFormFactory._ev_pfx + "get-list-item",
        post: ExoFormFactory._ev_pfx + "post",
        renderStart: ExoFormFactory._ev_pfx + "render-start",
        renderReady: ExoFormFactory._ev_pfx + "render-ready",
        change: ExoFormFactory._ev_pfx + "change",
        schemaLoaded: ExoFormFactory._ev_pfx + "form-loaded",
        interactive: ExoFormFactory._ev_pfx + "form-interactive" // when form is actually shown to user
    }

    static navigation = {
        none: ExoFormNoNavigation,
        default: ExoFormDefaultNavigation,
        wizard: ExoFormWizardNavigation,
        survey: ExoFormSurveyNavigation
    }

    static Context = ExoFormContext;

    static defaults = {
        imports: [
        ]
    }

    static html = {
        classes: {
            formContainer: "exf-container",
            pageContainer: "exf-page",
            elementContainer: "exf-ctl-cnt"
        }
    }

    static library = {};

    // setup static ExoForm.meta structure 
    static build(options) {
        options = options || {};

        return new Promise((resolve, reject) => {
            var promises = [];
            options.imports = options.imports || this.defaults.imports;
            
            // add standard controls from Base Libraries
            this.add(ExoBaseControls.controls);
            this.add(ExoExtendedControls.controls);
            this.add(ExoDevControls.controls);
            this.add(ExoChartControls.controls);

            if (options.add) {
                options.imports.push(...options.add);
            }


            options.imports.forEach(imp => {
                promises.push(
                    ExoFormFactory.loadLib(imp)
                )
            });

            Promise.all(promises).then(() => {
                let lib = ExoFormFactory.buildLibrary();
                console.debug("ExoFormFactory loaded library", lib, "from", options.imports);
                resolve(new ExoFormContext(lib));
            });

        })
    }

    static buildLibrary() {
        for (var name in ExoFormFactory.library) {
            var field = ExoFormFactory.library[name];
            field.typeName = name;
            field.returnValueType = String;
            field.type = this.lookupBaseType(name, field);

            field.isList = (field.type.prototype instanceof ExoFormFactory.library.list.type)
            if (field.isList) {
                field.isMultiSelect = field.type.isMultiSelect;
            }
            field.returnValueType = field.type.returnValueType;

            if (["date"].includes(field.typeName)) {
                field.returnValueType = Date;
            }
        }
        return ExoFormFactory.library;
    }

    

    static lookupBaseType(name, field) {
        let type = field.type;
        while (type === undefined) {
            if (field.base) {
                field = this.library[field.base];
                if (!field)
                    console.error("Invalid base type", field.base);

                type = field.type;

                if (!(type.prototype instanceof ExoFormFactory.library.base.type)) {
                    console.error("Class for " + name + " is not derived from ExoControlBase");
                }
            }
            else {
                break
            }
        }
        return type;
    }

    static async loadLib(src) {
        let lib = await import(src);
        let customType = lib.default;
        this.add(customType.controls);
    }

    // called from library implementations
    static add(lib) {
        //console.debug("Loading ", lib);

        for (var name in lib) {
            var field = lib[name];
            ExoFormFactory.library[name] = field;
        }
    }

    static listNativeProps(ctl) {
        let type = ctl.__proto__;
        let list = Object.getOwnPropertyNames(type);
        let ar =
            ["style", "class", "accesskey", "contenteditable",
                "dir", "disabled", "hidefocus", "lang", "language", "tabindex", "title", "unselectable",
                " xml:lang"];


        list.forEach(p => {
            let d = Object.getOwnPropertyDescriptor(type, p);
            let hasSetter = d.set !== undefined;
            if (hasSetter) {
                ar.push(p.toLowerCase())
            }
        });
        return ar;
    }

    static loadCustomControl(f, src) {
        return ExoFormFactory.importType(src);
    }

    static async importType(src) {
        return await import(src);
    }

    static checkTypeConversion(type, rawValue) {
        let fieldMeta = ExoFormFactory.library[type];
        let value = undefined;
        if (fieldMeta) {
            try {
                const parse = ExoFormFactory.getTypeParser(fieldMeta);
                value = parse(rawValue);
                if (value !== rawValue)
                    console.debug("Value '", rawValue, "' for field", type, " converted to", value, typeof (value));
            }
            catch (ex) {
                console.error("Error converting '" + value + "'to " + fieldMeta.returnValueType, ex);
            }

        }
        return value;
    }

    static getTypeParser(fieldMeta) {
        let type = fieldMeta.returnValueType;
        switch (type) {
            case Number: return Number.parseFloat;
            case Date: return ExoFormFactory.parseDate;
            case Boolean: return ExoFormFactory.parseBoolean;
            default:
                return v => { return v }

        }
    }

    static parseDate(value) {
        let dateValue = Date.parse(value);
        if (!isNaN(dateValue))
            return new Date(dateValue).toJSON();

        return dateValue;
    }

    static parseBoolean(value) {
        return parseInt(value) > 0 || value === "1" || value === "true" || value === "on";
    }

    static getFieldFromElement(e) {
        let field = null;
        if (e.getAttribute("data-exf")) {
            field = e.data["field"];
        }
        else if (e.classList.contains("exf-ctl-cnt")) {
            e = e.querySelector("[data-exf]");
            if (e) {
                field = e.data["field"];
            }
        }
        else {
            e = e.closest("[data-exf]");
            if (e) {
                field = e.data["field"];
            }
        }
        return field;
    }

    static fieldToString(f) {
        if (f) {
            let type = f.type || "unknown type";
            if (f.isPage)
                return "Page " + f.index + " (" + type + ")";
            else if (f.name || (f.id && f.elm))
                return "Field '" + (f.name || f.id) + "' (" + type + ")";

        }

        return "Unknown field";
    }

}

export default ExoFormFactory;