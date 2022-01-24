import ExoListControl from './ExoListControl';
import DOM from '../../../pwa/DOM';

const tpl = /*html*/`<div class="exf-ilc-cnt" title="{{tooltip}}">
    <input class="{{class}}" {{disabled}} {{checked}} name="{{inputname}}" value="{{value}}" type="{{type}}" id="{{oid}}" />
    <label for="{{oid}}" class="exf-caption">
        <div class="exf-caption-main">{{name}}</div>
        <div title="{{description}}" class="exf-caption-description">{{description}}</div>
    </label>
</div>`;

class ExoInputListControl extends ExoListControl {
    constructor() {
        super(...arguments);

        this.acceptProperties(
            {
                name: "items",
                description: "Array of entries to select from",
                type: Array
            },
            {
                name: "columns",
                type: Number,
                description: "Defines the number of columns to display the items in (default: 1)",
                default: 1
            },
            {
                name: "addcaption",
                description: "If set to a string, will allow you to append new items to the list",
                type: String
            }
        )

        this.htmlElement = DOM.parseHTML(
            /*html*/`<div data-evtarget="true" class="${this.context.field.class || ""}" ></div>`
        )
    }

    async render() {
        await super.render();
        
        this._rendered = false;

        return new Promise(resolve => {
            this._rendered = false;
            
            this.htmlElement.innerHTML = "";
            this.populateList(this.htmlElement, tpl).then(() => {
                this.container.classList.add("exf-input-group", "exf-std-lbl");

                if (this._columns)
                    this.htmlElement.style = `column-count: ${this.columns}; column-gap: 1rem;`

                if (this.addcaption) {
                    if (!Array.isArray(this.items))
                        throw TypeError("Must have an array as items for adding items to work");
                    this.setupAdd()
                }
                this._rendered = true;
                resolve(this.container);
            });
        });
    }

    setupAdd() {
        this.container.addEventListener("click", e => {
            let elm = e.target.closest(".exf-ilc-cnt");
            if (elm && !elm.nextElementSibling) {
                let label = elm.querySelector("label");
                e.preventDefault();
                setTimeout(() => {
                    this.dispatch("select-add");
                    label.contentEditable = true;
                    label.classList.add("single-line");
                    label.focus();
                    label.addEventListener("input", e => {
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                    });
                    label.addEventListener("keydown", e => {
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        let text = label.textContent.trim();
                        if (text !== this.addcaption && (e.key == "Enter" || e.key === "Tab")) {
                            this.add(text, elm)
                        }
                    });
                    label.addEventListener("blur", e => {
                        label.textContent = this.addcaption;
                        this.dispatch("deselect-add")
                    })

                    label.style.outline = "none";
                    document.execCommand('selectAll', false, null)

                }, 10);


            }
        })
    }

    async populateList(containerElm, tpl) {
        await super.populateList(containerElm, tpl);
        if (this.addcaption)
            this.addListItem(this.context.field, { value: "___new", name: this.addcaption }, tpl, containerElm, 0);
    }

    add(text, elm) {
        text = text?.trim();
        if (text && Array.isArray(this.items)) {
            let index = this.items.findIndex(i => {
                return i === text || typeof (i) === "object" && i.value === text;
            })
            if (index === -1) {
                this.items.push(text);
            }
            setTimeout(() => {
                this.value = this.isMultiSelect ? [text] : text;
                let evt = new Event("change", { bubbles: true, cancelable: true })
                this.htmlElement.dispatchEvent(evt);


                this.dispatch("add-item", {
                    text: text
                })
            }, 10);

        }
    }

    dispatch(name, details) {
        this.htmlElement.dispatchEvent(new CustomEvent(name, {
            bubbles: true, cancelable: false,
            detail: details
        }));
    }

    get valid() {
        if (this.context.field.required) {
            let numChecked = this.container.querySelectorAll("input:checked").length;
            if (numChecked === 0) {
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

    set columns(value) {
        if (isNaN(value) || value < 1 || value > 20)
            throw TypeError("Columns must be integer between 1 and 20");

        this._columns = value
    }

    get columns() {
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

    get items() {
        return this._items;
    }

    set items(value) {
        console.log("InputList Items " , value );
        
        if (!this._updating) {
            this._items = value;
            this._updating = true
            this.htmlElement.innerHTML = "";
            this.populateList(this.htmlElement, tpl).then(() => {
                this._updating = false;
            });
        }
    }
}

export default ExoInputListControl;