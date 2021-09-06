import ExoListControl from './ExoListControl';
import DOM from '../../../pwa/DOM';

class ExoInputListControl extends ExoListControl {
    constructor(context) {
        super(context);

        this.acceptProperties({
            name: "items",
            description: "Array of entries to select from",
            type: Array
        },
        {
            name: "columns",
            type: Number,
            description: "Defines the number of columns to display the items in (default: 1)",
            defaultValue: 1
        })
        
        this.htmlElement = DOM.parseHTML(
            
            /*html*/`<div data-evtarget="true" class="${this.context.field.class || ""}" ></div>`
            
        )
    }

    async render() {
        let f = this.context.field;

        const tpl = /*html*/`<div class="exf-ilc-cnt" title="{{tooltip}}">
            <input class="{{class}}" {{disabled}} {{checked}} name="{{inputname}}" value="{{value}}" type="{{type}}" id="{{oid}}" />
            <label for="{{oid}}" class="exf-caption">
                <div class="exf-caption-main">{{name}}</div>
                <div title="{{description}}" class="exf-caption-description">{{description}}</div>
            </label>
        </div>`;
        await this.populateList(this.htmlElement, tpl);

        await super.render();
        this.container.classList.add("exf-input-group", "exf-std-lbl");
        
        if(this._columns)
            this.htmlElement.style = `column-count: ${this.columns}; column-gap: 40px;`

        return this.container;
    }

    get valid() {
        if (this.context.field.required) {
            let numChecked = this.container.querySelectorAll("input:checked").length;
            if (numChecked === 0) {
                let inp = this.container.querySelector("input");
                try {
                    inp.setCustomValidity(this.getValidationMessage());
                    inp.reportValidity()
                } catch { };

                return false;
            }
        }
        return true;
    }

    get value() {
        return DOM.getValue(this.htmlElement.querySelector("[name]"));
    }

    set value(data) {
        let inp = this.htmlElement.querySelector("[name]");
        if (inp)
            inp.value = data;
    }

    set columns(value){
        if(isNaN(value) || value < 1 || value > 20)
            throw TypeError("Columns must be integer between 1 and 20");

        this._columns = value
    }

    get columns(){
        return this._columns;
    }

    // Used to get localized standard validation message 
    getValidationMessage() {
        let msg = "You must select a value",
            testFrm = DOM.parseHTML('<form><input name="test" required /></form>');
        testFrm.querySelector("input").addEventListener("invalid", e => {
            msg = e.validationMessage;
            e.preventDefault()
        });
        testFrm.submit();
        return msg;
    }

    showValidationError() {
        this.htmlElement.querySelector("input").setCustomValidity('This cannot be empty');
    }

    get validationMessage() {
        return this.htmlElement.querySelector("input").validationMessage;
    }
}

export default ExoInputListControl;