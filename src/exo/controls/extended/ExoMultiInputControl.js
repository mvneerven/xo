import ExoBaseControls from '../base';
import ExoFormFactory from '../../core/ExoFormFactory';
import DOM from '../../../pwa/DOM';

class ExoMultiInputControl extends ExoBaseControls.controls.div.type {
    columns = ""

    _areas = "";

    _inputs = {};

    gap = "0rem 1rem;";

    static returnValueType = Object;

    constructor() {
        super(...arguments);

        this.acceptProperties(
            {
                name: "grid-template",
                description: "CSS3 grid template",
                more: "https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template"
            },

            {
                name: "areas",
                description: "Grid template areas to set up on the containing div",
                example: `"field1 field1 field2"
                "field3 field4 field4"`
            },
            {
                name: "columns",
                description: "Grid columns to set up on containing div",
                example: "10em 10em 1fr"
            },
            {
                name: "gap",
                description: "Grid gap to set up on containing div",
                example: "16px"
            },
            {
                name: "fields", 
                type: Object,
                description: "Fields structure",
                example: {
                    first: { caption: "First", type: "text", maxlength: 30 },
                    last: { caption: "Last", type: "text", maxlength: 50 }
                }
            }

        );
        
        if (this._parent) {
            Object.entries(this.fields || {}).forEach(entry => {
                let options = {
                    ...entry[1],
                    name: this.name + "_" + entry[0]
                }

                for (var o in options) {
                    var v = options[o];
                    if (v === "inherit")
                        options[o] = this.context.field[o]
                }
                let control = this.createChild(options);
                this.controls[entry[0]] = control; // dictionary
                this._children.push(control)
            });
        }
    }

    set areas(value) {
        if (typeof (value) !== "string")
            throw TypeError("The areas property must be a string");

        if (value) {
            if (value.indexOf('"') === -1 && value.indexOf("'") == -1) {
                value = `'${value}'`;
            }
        }
        this._areas = value;
    }

    get fields() {
        return this._fields;
    }

    set fields(value) {
        // NA
    }

    get areas() {
        return this._areas;
    }

    async render() {
        await super.render();

        const me = this, f = me.context.field;

        this.htmlElement.classList.add("exf-cnt", "exf-ctl-group")

        if ((this.areas && this.columns) || this["grid-template"] || this.grid) {
            this.htmlElement.classList.add("grid");
        }

        if (this.areas && this.columns) {
            this.htmlElement.setAttribute("style", `display: grid; grid-template-areas: ${this.areas}; grid-template-columns: ${this.columns}; grid-gap: ${this.gap}`);
        }
        else {
            if (this["grid-template"]) {
                this.htmlElement.setAttribute("style", `display: grid; grid-template: ${this["grid-template"]}`);
            }
            else if (this.grid) {
                this.htmlElement.classList.add(this.grid)
            }
        }
        
        this.children.forEach(async control => {
            let span = document.createElement("span");
            me.htmlElement.appendChild(span);
            let elm = await control.render();

            if (me.areas) {
                let name = control.name.split("_").pop();
                elm.setAttribute("style", `grid-area: ${name}`);
            }
            DOM.replace(span, elm);
        });

        // inform system that this is the master control 
        // See: ExoFormFactory.getFieldFromElement(... , {master: true})
        this.htmlElement.setAttribute("data-exf-master", "multiinput");

        return this.container;
    }

    get controls() {
        return this._inputs
    }

    set controls(value) {
        // NA
    }

    set fields(value){
        this._fields = value;
    }

    get fields(){
        return this._fields;
    }

    focus() {

        for (var key in this.controls) {
            xo.control.get(this.controls[key])?.focus();
            break
        }
    }

    get value() {

        let data = this.context.field.value || {};

        for (var key in this.controls) {
            let control = this.controls[key]
            data[key] = control.value;
        }
        return data
    }

    set value(data) {
        data = data || {};
        this.context.field.value = data

        for (var key in this.controls) {
            let control = this.controls[key]
            control.value = data[key] || "";
        }
    }

    get valid() {
        let v = true;

        for (var key in this.controls) {
            let control = this.controls[key]
            if (control && !control.valid)
                v = false;
        }
        return v;
    }

    showValidationError() {
        for (var key in this.controls) {
            let control = this.controls[key]
            if (control) {
                let elm = control.htmlElement
                if (elm && !elm.checkValidity()) {
                    if (elm.reportValidity)
                        elm.reportValidity();

                    return false;
                }
            }
        }

        return true;
    }

    getFormElement(elm) {
        if (elm.name && elm.form)
            return elm;

        return elm.querySelector("[name]") || elm;
    }

}

export default ExoMultiInputControl;