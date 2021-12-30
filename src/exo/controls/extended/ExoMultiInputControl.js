import ExoBaseControls from '../base';
import ExoFormFactory from '../../core/ExoFormFactory';

class ExoMultiInputControl extends ExoBaseControls.controls.div.type {
    columns = ""

    _areas = "";

    gap = "0rem 1rem;";

    static returnValueType = Object;

    constructor(context) {
        super(context);

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
                name: "fields", type: Object,
                description: "Fields structure",
                example: {
                    first: { caption: "First", type: "text", maxlength: 30 },
                    last: { caption: "Last", type: "text", maxlength: 50 }
                }
            }

        );
    }

    set areas(value){
        if(typeof(value) !== "string")
            throw TypeError("The areas property must be a string");

        if(value){
            if(value.indexOf('"') === -1 && value.indexOf("'") == -1){
                value = `'${value}'`;
            }
        }
        this._areas = value;
    }

    get areas(){
        return this._areas;
    }

    async render() {

        await super.render();

        const _ = this;
        const f = _.context.field;
        const exo = _.context.exo;

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


        const rs = async (name, options) => {
            return _.context.exo.renderSingleControl(options)
        }

        _.inputs = {}

        const add = async (n, options) => {

            options = {
                ...options,
                name: f.name + "_" + n
            }

            for (var o in options) {
                var v = options[o];
                if (v === "inherit")
                    options[o] = f[o]
            }


            _.inputs[n] = await rs(n, options);
            _.inputs[n].setAttribute("data-multi-name", options.name);
            _.htmlElement.appendChild(_.inputs[n])
            return _.inputs[n];
        }


        if (!this.fields && f.fields) {
            this.fields = f.fields;
        }

        for (var n in this.fields) {
            var elm = await add(n, this.fields[n])

            if (this.areas){                
                elm.setAttribute("style", `grid-area: ${n}`);
            }
        };

        // inform system that this is the master control 
        // See: ExoFormFactory.getFieldFromElement(... , {master: true})
        this.htmlElement.setAttribute("exf-data-master", "multiinput");
        return this.container;

    }

    focus() {

        for(var n in this.fields){
            var elm = this._qs(n);
            if (elm) {
                let fld = ExoFormFactory.getFieldFromElement(elm);
                let ctl = fld._control
                ctl.focus();
            }
            break;
        }
    }

    _qs(name) {
        const f = this.context.field;
        if (this.htmlElement) {
            return this.htmlElement.querySelector('[data-multi-name="' + f.name + "_" + name + '"]')
        }
        return "";
    }

    get value() {

        let data = this.context.field.value || {};

        for (var n in this.fields) {
            var elm = this._qs(n);
            if (elm) {
                let fld = ExoFormFactory.getFieldFromElement(elm);
                data[n] = fld._control.value;
            }
        }
        return data
    }

    set value(data) {
        data = data || {};
        this.context.field.value = data
        for (var n in this.fields) {
            data[n] = data[n] || "";
            this.fields[n].value = data[n];
            var elm = this._qs(n);
            if (elm) {
                let fld = ExoFormFactory.getFieldFromElement(elm);
                fld._control.value = data[n];
            }
        }
    }

    get valid() {
        let v = true;
        for (var n in this.fields) {
            var elm = this._qs(n);
            let fld = ExoFormFactory.getFieldFromElement(elm);
            if (!fld._control.valid) {
                v = false;
            }
        }
        return v;
    }

    showValidationError() {

        for (var n in this.fields) {
            var elm = this.getFormElement(this._qs(n));
            if (!elm.checkValidity()) {
                if (elm.reportValidity)
                    elm.reportValidity();

                return false;
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