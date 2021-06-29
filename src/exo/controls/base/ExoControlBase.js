import ExoFormFactory from '../../core/ExoFormFactory';
import ExoForm from '../../core/ExoForm';
import DOM from '../../../pwa/DOM';

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
            { name: "visible", type: Boolean, description: "Determines control visibility" },
            { name: "tooltip", type: String, description: "Tooltip to show over the element" },
            { name: "disabled", type: Boolean, description: "Determines whether the control can be interacted with by the user" },
            { name: "caption", type: String, description: "Caption/label to display" },
            { name: "useContainer", type: Boolean, description: "Specifies whether the control should render within the standard control container. Default depends on control." },
            { name: "bind", type: String, description: "Specifies a path to bind the control to one of the instances in the model, if any. Syntax: 'instance.[instancename].[propertyname]'" }
        );
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

            let prop = this.acceptedProperties.find(e => {
                return e.name === p.name
            })

            if (!prop) {
                this.acceptedProperties.push(p);
                if (this.context.field[p.name] !== undefined) {
                    this[p.name] = this._processProp(p.name, this.context.field[p.name]);
                }
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

        this._rendered = true;
        return this.container
    }

    addEventListeners() {
        const _ = this;
        const exo = _.context.exo;
        const f = _.context.field;

        _.htmlElement.addEventListener("invalid", e => {
            console.debug("check validity on ", e.target, "submitCheck", _.submitCheck);

            if (e.target.closest("[data-page]").getAttribute("data-skip") === "true") {
                console.debug("invalid event on skipped control", e.target.name);
                e.preventDefault();
                return false;
            }
            else
                return exo.addins.validation.testValidity(e, f);

        });

        _.htmlElement.addEventListener("change", e => {
            let isDirty = e.target.value != e.target.defaultValue;
            let el = e.target.closest(".exf-ctl-cnt");
            if (el)
                el.classList[isDirty ? "add" : "remove"]("exf-dirty");
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
            if (el.reportValidity) {
                try {
                    if (!el.reportValidity()) {
                        numInvalid++;
                    }
                }
                catch { }
            }
        };
        let elm = this.container || this.htmlElement;
        rv(elm);
        elm.querySelectorAll("*").forEach(rv);
        return numInvalid === 0;
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

        if (!msg) {
            if (this._error != null) {
                this._error.parentNode.removeChild(this._error);
                this._error = null;
            }

            if (this.container) {
                this.container.removeAttribute('aria-invalid');
                this.container.classList.remove("exf-invalid");
            }
            return;
        }

        options = options || { type: "info" };

        if (this._error != null) {
            this._error.innerHTML = msg
            return;
        }

        this._error = DOM.parseHTML(`<div class="exf-help exf-help-${options.type}">${msg}</div>`)

        if (options.type === "invalid") {
            this.container.setAttribute('aria-invalid', 'true');
            this.container.classList.add('exf-invalid');
        }

        this.container.querySelector(":scope > .exf-fld-details > .exf-help-wrapper").appendChild(this._error);

    }
}

export default ExoControlBase;
