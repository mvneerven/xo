import ExoFormFactory from '../../core/ExoFormFactory';
import ExoForm from '../../core/ExoForm';
import DOM from '../../../pwa/DOM';
import JSONSchema from '../../core/JSONSchema';

/**
 * Abstract base class for ExoForm controls
 */
class ExoControlBase {
    attributes = {};

    _visible = true;
    _disabled = false;
    _rendered = false;
    _useContainer = true;

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
            { name: "disabled", type: Boolean, group: "UI", description: "Determines whether the control can be interacted with by the user" },
            { name: "tooltip", type: String, group: "UI", description: "Tooltip to show over the element" },
            { name: "info", type: String, group: "UI", description: "Informational text to show to help the user" },
            //{ name: "class", type: String, group: "General", description: "Class name(s) to add to container element" },
            { name: "placeholder", type: String, group: "UI", description: "Placeholder text to show when the field is empty" },
            { name: "useContainer", type: Boolean, group: "Advanced", default: true, description: "Specifies whether the control should render within the standard control container. Default depends on control." },
            { name: "bind", type: String, group: "Data", description: "Specifies a path to bind the control to one of the instances in the model, if any. Syntax: 'instance.[instancename].[propertyname]'" },
            { name: "invalidmessage", type: String, group: "Data", description: "Message text to show when the control doesn't validate" },

            { name: "value", type: String, group: "Data", description: "Value of the control" },
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
                if (p.objectSchema && p.objectSchema.properties) {
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
        console.log(this, schema);
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

    getBindings() {
        let ar = [];
        let m = this.context.exo.dataBinding.model;
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
     * Specifies whether ExoForm should use a containing DIV element to render the control.
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
        if (obj.id && obj.id.length === 15) {
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
     * Rerenders the control with the given field schema
     */
    set schema(data) {
        data = typeof (data) === "object" ? data : JSON.parse(data);

        const helper = async () => {
            let newElm = await this.context.exo.renderSingleControl(data, {
                context: this.context
            })

            //newElm.classList.add("exf-le-active");
            let exCntNew = newElm.querySelector("[data-exf]");
            let ctl = exCntNew.data.field._control;
            let fld = this.context.field;
            fld._control = ctl;
            exCntNew.data = { field: fld }

            DOM.replace(this.container, newElm)
        }

        helper();

        this.context.field = data;
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
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", true, true);
        evt.detail = detail;
        this.htmlElement.dispatchEvent(evt);
    }

    set visible(value) {
        this._visible = value;
        if (this.rendered) {
            var elm = this.container || this.htmlElement;
            elm.style.display = value ? "block" : "none";
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

        ar.push("exf-base-" + this._getBaseType())

        if (this.htmlElement.tagName === "INPUT" || this.htmlElement.tagName === "TEXTAREA")
            ar.push("exf-input");

        if (this.context.field.readOnly)
            ar.push("exf-readonly");

        if (this.context.field.disabled)
            ar.push("exf-disabled");

        return ar;
    }

    _getBaseType() {

        let returns = this.context.field.returnValueType ? this.context.field.returnValueType.name : "String";

        if (this.isTextInput)
            return "text";

        if (returns === "Boolean")
            return "bool";

        if (returns === "Array")
            return "multi";

        return "default";
    }

    async render() {
        this.setProperties();

        for (var a in this.attributes) {
            if (a === "required") {
                this._htmlElement.required = this.attributes[a];
                continue;
            }
            this._htmlElement.setAttribute(a, this.attributes[a]);
        }
        for (var a in this.dataProps) {
            this._htmlElement.setAttribute("data-" + a, this.dataProps[a]);
        }

        let obj = this._scope();
        this.container = DOM.parseHTML(
            this._getContainerTemplate(obj)
        );

        if (this.name && DOM.isPropertyAttr(this.htmlElement, "name"))
            this.htmlElement.setAttribute("name", this.name);


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

        this.addEventListeners();

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


        this._rendered = true;

        if (!this.visible)
            this.visible = this.visible; // force 


        return this.container
    }

    addEventListeners() {
        const exo = this.context.exo;
        const f = this.context.field;

        this.htmlElement.addEventListener("invalid", e => {
            if (e.target.closest("[data-page]").getAttribute("data-skip") === "true") {
                console.debug("invalid event on skipped control", e.target.name);
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
            //caption: this._processProp("caption", f.caption) || "",
            tooltip: f.tooltip || "",
            id: obj.id + "-container"
        }
    }


    setProperties() {
        let f = this.context.field;

        for (var prop in f) {

            let name = prop.toLowerCase();
            let value = f[name];

            if (name !== "bind" && ExoForm.meta.properties.reserved.includes(name)) {
                //f[name] = this._processProp(name, value);
                continue;
            }

            let useName = prop;// ExoForm.meta.properties.map[prop] || prop;

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
        let db = this.context.exo.dataBinding;
        if (db) {
            return db._processFieldProperty(this, name, value);
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
        console.debug("ExoControlBase valid", DOM.elementToString(elm), numInvalid === 0)
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
        if (this.htmlElement && this.htmlElement.reportValidity)
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

        //console.log(elmName, msg)

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
