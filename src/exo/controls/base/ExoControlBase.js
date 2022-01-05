import ExoFormFactory from '../../core/ExoFormFactory';
import ExoForm from '../../core/ExoForm';
import DOM from '../../../pwa/DOM';
import JSONSchema from '../../core/JSONSchema';
import ExoFormSchema from '../../core/ExoFormSchema';

/**
 * Abstract base class for XO form controls
 */
class ExoControlBase {
    attributes = {};

    _visible = true;
    _disabled = false;
    _rendered = false;
    _useContainer = true;
    _cssVariables = {};
    _actions = [];
    acceptedProperties = [];

    dataProps = {};

    static returnValueType = undefined;

    constructor(context) {
        if (this.constructor === ExoControlBase)
            throw TypeError("Can't instantiate abstract class!");

        this.context = context;
        if (!context || !context.field || !context.exo)
            throw TypeError("Invalid instantiation of ExoControlBase");

        this.htmlElement = document.createElement('span');

        this.acceptProperties(
            { name: "type", type: String, required: true, group: "General", description: "Type of the control. Required" },
            { name: "name", type: String, required: true, group: "General", description: "Name of the control. Required and must be unique" },
            { name: "caption", type: String, group: "UI", description: "Caption/label to display" },
            { name: "hidden", type: Boolean, group: "UI", default: false, description: "Determines control visibility" },
            { name: "disabled", type: Boolean, group: "UI", description: "Specifies whether the control can be interacted with by the user" },
            { name: "required", type: Boolean, group: "Data", description: "Specifies whether the field is required" },
            { name: "tooltip", type: String, group: "UI", description: "Tooltip to show over the element" },
            { name: "info", type: String, group: "UI", description: "Informational text to show to help the user" },
            { name: "placeholder", type: String, group: "UI", description: "Placeholder text to show when the field is empty" },
            { name: "useContainer", type: Boolean, group: "Advanced", default: true, description: "Specifies whether the control should render within the standard control container. Default depends on control." },
            { name: "bind", type: String, group: "Data", description: "Specifies a path to bind the control to one of the instances in the model, if any. Syntax: 'instance.[instancename].[propertyname]'" },
            { name: "invalidmessage", type: String, group: "Data", description: "Message text to show when the control doesn't validate" },
            { name: "value", type: String, group: "Data", description: "Value of the control" },
            { name: "remark", type: String, description: "Generic comment/remark - use like HTML or JavaScript comments" },
            { name: "break", type: Boolean, description: "Set breakpoint" },
            { name: "css", type: Object },
            { name: "actions", type: Array, description: "List of actions to (conditionally) perform" }

        );
    }

    /**
     * Gets the control properties as a JSON schema 
     */
    get jsonSchema() {

        const objSchema = {
            type: "object",
            properties: {},
            required: []
        }

        const schema = {
            $schema: "http://json-schema.org/draft-04/schema#",
            ...objSchema
        }

        this.acceptedProperties.forEach(p => {
            if (p.required) {
                schema.required.push(p.name)
            }

            let jsonSchemaType = JSONSchema.getTypeName(p.type);

            schema.properties[p.name] = {
                type: jsonSchemaType,
                description: p.description
            }

            if (jsonSchemaType === "object") {
                if (p.objectSchema?.properties) {
                    schema.properties[p.name] = {
                        ...schema.properties[p.name],
                        ...p.objectSchema
                    }
                }
                else {
                    schema.properties[p.name] = {
                        ...schema.properties[p.name],
                        type: "aceeditor",
                        mode: "json"
                    }
                }
            }
        });
        return schema;
    }

    get propertyUIMappings() {
        const mappings = {
            pages: {},
            properties: {}
        }

        this.acceptedProperties.forEach(p => {

            let group = p.group || this.getDefaultGroup(p);

            mappings.pages[group] = {
                ...mappings.pages[group] || {}
            }

            mappings.properties[p.name] = {
                ...mappings.properties[p.name] || {},
                page: group,
                tooltip: p.description
            }

            switch (p.name) {
                case "type":
                    mappings.properties[p.name] = {
                        ...mappings.properties[p.name],
                        disabled: true
                    }
                    break;
                case "bind":
                    mappings.properties[p.name] = {
                        ...mappings.properties[p.name] || {},
                        autocomplete: {
                            items: e => {
                                return this.getBindings()
                            }
                        }
                    }
                    break
            }
        });

        return mappings;
    }

    /**
     * Returns a reference to the CSS variables included 
     */
    get cssVariables() {
        return this._cssVariables;
    }

    renderStyleSheet() {

        const keys = this.cssVariables ? Object.keys(this.cssVariables) : null;
        if (keys?.length) {
            const cid = this.context.field.id;
            const id = `ctl-variables-${cid}`,
                prevStyleSheet = document.getElementById(id);
            if (prevStyleSheet) prevStyleSheet.remove();

            const cssSheet = document.createElement("style");
            cssSheet.id = id;
            const css = keys.map(
                (c) => `${c}: ${this.cssVariables[c]};`
            );
            cssSheet.innerHTML = `[data-id="${cid}"] { ${css.join(
                " "
            )} }`;
            document.querySelector("head").appendChild(cssSheet);
        }
    }

    getBindings() {
        let ar = [];
        let m = this.dataBinding.model;
        Object.keys(m.instance).forEach(i => {
            Object.keys(m.instance[i]).forEach(d => {

                ar.push({
                    text: `instance.${i}.${d}`
                })
            });
        })

        if (m.schemas) {

            Object.keys(m.schemas).forEach(s => {
                Object.keys(m.schemas[s].properties).forEach(d => {
                    const entry = {
                        text: `instance.${s}.${d}`
                    };

                    if (ar.indexOf(h => { h.text === entry.text }) === -1) ar.push(entry)
                })
            })
        }

        return ar;
    }

    getDefaultGroup(property) {
        switch (property.name) {
            case "value":
            case "bind":
            case "invalidmessage":
                return "Data";
        }
        return "Control";
    }

    _getContainerTemplate(obj) {

        if (this.context.field.isPage) {
            return DOM.format( /*html*/`<span data-replace="true"></span>`, this._getContainerAttributes(obj))
        }

        else if (!this.useContainer) {

            const tpl = /*html*/`<div data-id="{{id}}" class="exf-ctl-cnt exf-ctl-bare"><span data-replace="true"></span></div>`;

            return DOM.format(tpl, this._getContainerAttributes(obj))
        }

        return /*html*/`<div data-id="${obj.id}" class="${obj.class}" data-field-type="${obj.type}">
    <div class="exf-ctl">
        <label for="${obj.id}" aria-hidden="true" class="exf-label" title="${obj.caption}">${obj.caption}</label>
        
        <span data-replace="true"></span>
        
    </div>
    <div class="exf-fld-details">
        <div class="exf-help-wrapper"></div>
    </div>
</div>`;
    }

    /**
     * Sets the HTML element
     */
    set htmlElement(el) {
        this._htmlElement = el;
        this.allowedAttributes = ExoFormFactory.listNativeProps(this.htmlElement);
        this.isSelfClosing = [
            "area", "base", "col", "embed", "hr", "img", "input",
            "link", "meta", "param", "source", "track", "wbr"
        ].includes(el.tagName.toLowerCase());
    }

    get htmlElement() {
        return this._htmlElement;
    }

    /**
     * Specifies whether XO form should use a containing DIV element to render the control.
     * By default for instance, the button and the page control don't use a container.
     */
    set useContainer(value) {
        this._useContainer = value
    }

    get useContainer() {
        return this._useContainer;
    }

    toString() {
        return ExoFormFactory.fieldToString(this.context.field);
    }

    appendChild(elm) {
        this.htmlElement.appendChild(elm);
    }

    typeConvert(value) {
        return ExoFormFactory.checkTypeConversion(this.context.field.type, value)
    }

    set actions(data) {
        this._actions = data;
    }

    get actions() {
        return this._actions;
    }

    /**
     * The control's caption/label
     */
    get caption() {
        return this._caption;
    }

    /**
     * Gets the current field schema
     */
    get schema() {

        let obj = {
            ...this.context.field
        }
        if (obj.id && obj.id.length === 15 && obj.id.startsWith("exf")) {
            delete obj.id
        }

        obj = JSON.parse(JSON.stringify(obj, (key, value) => {
            if (key.startsWith("_"))
                return undefined;
            return value;
        }, 2))

        this.acceptedProperties.forEach(p => {
            if (typeof (p.default) !== "undefined") {
                if (p.default != this[p.name])
                    obj[p.name] = this[p.name]
            }
        })
        return obj;
    }

    /**
     * Rerenders the control with the given field schema and returns a reference to the updated control.
     */
    async updateSchema(data) {
        data = typeof (data) === "object" ? data : JSON.parse(data);

        const helper = async () => {
            let newElm = await this.context.exo.renderSingleControl(data, {
                context: this.context
            })

            let exCntNew = newElm.querySelector("[data-exf]");
            let ctl = exCntNew.data.field._control;
            let fld = this.context.field;
            fld._control = ctl;
            exCntNew.data = { field: fld }

            DOM.replace(this.container, newElm)
            return ctl;
        }

        const newControl = await helper();

        this.context.field = data;
        return newControl;
    }

    /**
     * The control's caption/label
     */
    set caption(value) {
        this._caption = value;
        if (this.rendered) {
            let label = this.container.querySelector(".exf-label");
            if (label) {
                label.innerText = this._caption;
            }
        }
    }

    get value() {
        let v = this.htmlElement.value;
        return this.typeConvert(v);
    }

    set value(data) {
        this.htmlElement.value = data;
        if (this.rendered) {
            this.container.classList[data ? "add" : "remove"]("exf-filled");
        }
    }

    focus() {
        try {
            this.htmlElement.focus();
        }
        catch { }
    }

    triggerChange(detail) {
        var evt = new Event("change", { bubbles: true, cancelable: true })
        evt.detail = detail;
        this.htmlElement.dispatchEvent(evt);
    }

    set visible(value) {
        this._visible = value;
        if (this.rendered) {
            var elm = this.container || this.htmlElement;
            elm.style.display = value ? "unset" : "none";
        }
    }

    get visible() {
        return this._visible;
    }

    set hidden(value) {
        this.visible = !value;
    }

    get hidden() {
        return !this.visible;
    }

    set disabled(value) {
        this._disabled = value;

        if (this.rendered) {
            if (value) {
                //this.htmlElement.setAttribute("disabled", "disabled")
                this.container.classList.add("exf-disabled");
            }
            else {

                //this.htmlElement.removeAttribute("disabled");
                this.container.classList.remove("exf-disabled");
            }
        }
    }

    get rendered() {
        return this._rendered;
    }

    get disabled() {
        return this._disabled;
    }

    /*
    * Tell system which properties to take from the configured field schema
    */
    acceptProperties(...ar) {

        ar.forEach(p => {
            if (typeof (p) === "string") {
                p = {
                    name: p
                }
            }

            let ix = this.acceptedProperties.indexOf(a => {
                return e.name === p.name
            })

            if (ix === -1) {
                this.acceptedProperties.push(p);

                // if (this.context.field[p.name] !== undefined || p.default) {
                //     this[p.name] = this._processProp(p.name, this.context.field[p.name] || p.default);
                // }
            }
            else {
                // merge new (subclassed) accepted properties
                this.acceptedProperties[ix] = {
                    ...this.acceptedProperties[ix],
                    ...p
                }

            }

            if (typeof (this.context.field[p.name]) !== "undefined") {
                this[p.name] = this._processProp(p.name, this.context.field[p.name]);
            }
            else if (typeof (p.default) !== "undefined") {
                this[p.name] = this._processProp(p.name, p.default);
            }

        });
    }

    _scope() {
        let f = this.context.field;
        return {
            ...f,
            caption: f.caption || "",
            tooltip: f.tooltip || "",
            class: f.class || "",
            id: f.id
        }
    }

    _addContainerClasses() {
        this.container.classList.add(...this._getContainerClasses())
    }

    _getContainerClasses() {
        let ar = [];

        if (!this.isPage)
            ar.push("exf-ctl-cnt")

        ar.push("exf-base-" + this.baseType)

        if (this.context.field.readOnly)
            ar.push("exf-readonly");

        if (this.context.field.disabled)
            ar.push("exf-disabled");

        return ar;
    }

    get baseType() {
        return "default";
    }

    async render() {
        this._registerActions()

        this.setProperties();
        if (this.break) {
            debugger // LEAVE THIS HERE!
        }

        for (var a in this.attributes) {
            if (a === "required") {
                this._htmlElement.required = this.attributes[a];
                continue;
            }
            this._htmlElement.setAttribute(a, this.attributes[a]);
        }
        for (var a in this.dataProps) {
            if (this.dataProps[a])
                this._htmlElement.setAttribute("data-" + a, this.dataProps[a]);
        }

        let obj = this._scope();
        this.container = DOM.parseHTML(
            this._getContainerTemplate(obj)
        );

        // make sure all (form) elements that require 'name' have one.
        if (DOM.isPropertyAttr(this.htmlElement, "name")) {
            if (!this.name)
                this.name = obj.id; 
            this.htmlElement.setAttribute("name", this.name);
        }

        if (!obj.caption || obj.caption.length === 0) {
            this.container.classList.add("exf-lbl-empty");
        }

        if (this.container.getAttribute("data-replace") === "true")
            this.container = this.htmlElement;
        else {
            let toReplace = this.container.querySelector('[data-replace="true"]');
            if (!toReplace)
                this.container = this.htmlElement;
            else
                DOM.replace(toReplace, this.htmlElement);
        }

        this._addEventListeners();

        if (this.context.field.required) {
            this.container.classList.add("exf-required");
        }

        // apply value if set in field
        if (this.context.field.value) {
            this.value = this.context.field.value;
            if (this.value)
                this.container.classList.add("exf-filled");
        }

        this._addContainerClasses();

        if (this.tooltip) {
            this.container.setAttribute("title", this.tooltip);
        }

        if (this.info) {
            this.showHelp(this.info)
        }

        if (this.placeholder) {
            this.htmlElement.setAttribute("placeholder", this.placeholder)
        }

        if (this.caption)
            this.htmlElement.setAttribute("aria-label", this.caption)

        this._rendered = true;

        if (this.css) {

            Object.entries(this.css).map(i => {
                this.cssVariables[i[0]] = i[1];
            })

        }

        this.renderStyleSheet();

        return this.container
    }

    _registerActions() {
        if (this.actions?.length) {
            this.rulesEngine.addActions(this, this.actions);
        }
    }

    /**
     * Returns a reference to the data binding context. Can be the parent control's databinding context.
     */
    get dataBinding() {
        return (this.parentControl || this).context.exo.dataBinding;
    }

    /** 
     * Gets the attached rules engine 
    */
    get rulesEngine() {
        // if this is a single-rendered control, take parentControl context
        return (this.parentControl || this).context.exo.addins.rules
    }

    /**
     * Returns the parent control, when rendered as a single field in a context of another control, such as a group.
     */
    get parentControl() {
        return this.context.exo.options.parentControl;
    }

    _addEventListeners() {
        const exo = this.context.exo;
        const f = this.context.field;

        this.htmlElement.addEventListener("invalid", e => {
            if (e.target.closest("[data-page]").getAttribute("data-skip") === "true") {
                e.preventDefault();
                return false;
            }
            else
                return exo.addins.validation.testValidity(e, f);

        });

        this.htmlElement.addEventListener("change", e => {
            let isDirty = e.target.value != e.target.defaultValue;
            let el = e.target.closest(".exf-ctl-cnt");
            if (el)
                el.classList[isDirty ? "add" : "remove"]("exf-dirty");
        })

        this.htmlElement.addEventListener("input", e => {
            if (this.htmlElement.validity) {
                if (this.htmlElement.setCustomValidity) this.htmlElement.setCustomValidity('');
                let valid = this.htmlElement.validity.valid;
                this.checkCustomValidity(valid)
            }

        })

    }

    _getContainerAttributes(obj) {
        let f = this.context.field;
        return {
            ...f,
            caption: f.caption || "",
            tooltip: f.tooltip || ""
        }
    }

    setProperties() {
        let f = this.context.field;

        if (f.bind) {
            f.name = f.name || ExoFormSchema.getPathFromBind(f.bind);
            this.name = f.name;
        }

        for (var prop in f) {

            let name = prop.toLowerCase();
            let value = f[name];

            if (name !== "bind" && ExoForm.meta.properties.reserved.includes(name)) {
                continue;
            }

            let useName = prop;

            let isSet = this.acceptedProperties.find(e => {
                return e.name === useName
            })
            if (isSet)
                continue;

            if (this.allowedAttributes.includes(useName)) {
                this.attributes[useName] = this._processProp(name, value);
            }
            else {

                if (typeof (value) === "object") {
                    this[useName] = value;
                }
                else {
                    this.dataProps[useName] = this._processProp(name, value);
                }
            }
        }


    }

    // dataBinding with '@bindingpath'
    _processProp(name, value) {
        // resolve bound state 
        let db = this.dataBinding;
        if (db) {
            try {
                let result = db._processFieldProperty(this, name, value);
                return result;
            }
            catch (ex) {
                throw TypeError(`Databinding error in ${this.name}.${name}: ${ex.toString()}`)
            }
        }

        return value;
    }

    // returns valid state of the control - can be subclassed
    get valid() {
        let numInvalid = 0;
        const rv = el => {
            if (el.validity) {
                let valid = el.validity.valid;
                if (!valid) numInvalid++;
            }
        };
        let elm = this.container || this.htmlElement;
        rv(elm);

        elm.querySelectorAll("*").forEach(rv);
        return numInvalid === 0;
    }

    checkCustomValidity(valid) {
        if (this.invalidmessage) {
            this.htmlElement.setCustomValidity(valid ? '' : this.invalidmessage);
            this.htmlElement.reportValidity();
        }
    }

    get validationMessage() {
        let msg = "";
        this.container.querySelectorAll("*").forEach(el => {
            if (el.validationMessage) {
                msg = el.validationMessage;
            }
        })
        return msg;
    }

    showValidationError() {
        if (this.htmlElement?.reportValidity)
            return this.htmlElement.reportValidity()

        return true;
    }

    /**
     * Displays a help text to the user. Pass with empty @msg to hide.
     * @param {String} msg - The message to display
     * @param {Object} options - The options (type: "info|error|invalid")
     */
    showHelp(msg, options) {
        options = options || { type: "info" };
        let elmName = "_hlpr_" + options.type;

        if (!msg) {
            if (this[elmName] != null) {
                this[elmName].parentNode.removeChild(this[elmName]);
                this[elmName] = null;
            }

            if (this.container) {
                this.container.removeAttribute('aria-invalid');
                this.container.classList.remove("exf-invalid");
            }
            return;
        }



        if (this[elmName] != null) {
            this[elmName].innerHTML = msg
            return;
        }

        this[elmName] = DOM.parseHTML(`<div class="exf-help exf-help-${options.type}">${msg}</div>`)

        if (options.type === "invalid") {
            this.container.setAttribute('aria-invalid', 'true');
            this.container.classList.add('exf-invalid');
        }

        this.container.querySelector(":scope > .exf-fld-details > .exf-help-wrapper")
            .appendChild(this[elmName]);

    }
}

export default ExoControlBase;
