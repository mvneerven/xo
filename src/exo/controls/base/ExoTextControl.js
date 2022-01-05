import ExoInputControl from './ExoInputControl';
import DOM from '../../../pwa/DOM';
import ExoTextControlAutoCompleteExtension from './ExoTextControlAutoCompleteExtension';

// Textbox control (input[type=text])
class ExoTextControl extends ExoInputControl {
    constructor(context) {
        super(context);

        this.isTextInput = true;
        this.htmlElement = DOM.parseHTML('<input type="text"/>');

        const preSufSchema = { // TODO: implement in 
            $schema: "http://json-schema.org/draft-04/schema#",
            properties: {
                type: {type: "string"},
                name: {type: "string"},
                icon: {type: "string"},
                char: {type: "string", max: 1},
                font: {type: "string"}
            }
        }

        this.acceptProperties(
            {
                name: "prefix",
                type: Object,
                objectSchema: preSufSchema,
                description: `Prefix to display in input (e.g. '$'). 
                Use object notation to specify icon or font. 
                - prefix: {char: "◷", font: "Segoe UI"}
                - prefix: {icon: "ti-search"}
                - prefix: {
                    type: "button",
                    name: "openbtn"
                    icon: "ti-open"
                }`

            },
            {
                name: "suffix",
                type: Object,
                objectSchema: preSufSchema,
                description: `Suffix to display in input. 
                Use object notation to specify icon or font. 
                - prefix: {char: "◷", font: "Segoe UI"}
                - prefix: {icon: "ti-search"}
                - prefix: {
                    type: "button",
                    name: "openbtn"
                    icon: "ti-open"
                }`

            },

            {
                name: "autocomplete",
                type: Object,
                description: `Object describing autocompletion settings.

                - autocomplete: {items: ["Mr", "Mrs", "Ms"]}
                - autocomplete: this.myAutoCompleteProvider.bind(this)
                - autocomplete: {
                    items: "https://restcountries.eu/rest/v2/name/%search%",
                    map: "name",
                    minlength: 2,
                    max: 5
                  }`
            });
    }

    get baseType(){
        return "text";
    }

    async render() {
        var f = this.context.field;

        await super.render();

        if (f.mask) {
            DOM.maskInput(this.htmlElement, {
                mask: f.mask,
                format: f.format
            })
        }



        for (const x of ["prefix", "suffix"]) {
            if (this[x]) {
                //this.htmlElement.closest(".exf-ctl").setAttribute("data-prefix", this.prefix)
                this.container.classList.add("exf-std-lbl");
                await this.addPreOrSuffix(x, this[x])
            }
        }

        if (this.autocomplete) {
            this.autocomplete.attach();
        }

        return this.container;
    }

    async addPreOrSuffix(type, obj) {
        this.container.classList.add("exf-txt-psx", type);

        let span = document.createElement("span");
        span.classList.add("exf-txt-psx-span", type);
        if (obj.icon) {
            const list = obj.icon.split(" ");
            span.classList.add(...list);
            span.classList.add("icon");
        }
        else if (obj.field) { // field
            span.classList.add("field")
            let elm = await xo.form.run(obj.field);
            span.appendChild(elm);
        }
        else {
            span.classList.add("char")
            span.innerHTML = obj.char ? obj.char : obj;
            span.style = `${(obj.font ? "font-family: "
                + obj.font : "")}; ${(obj.size ? "font-size: " + obj.size + "; line-height: " + obj.size : "")}`;
        }
        this.container.querySelector(".exf-ctl").appendChild(span);
    }

    get prefix() {
        return this._prefix;
    }

    set prefix(value) {
        this._prefix = value;
    }

    get suffix() {
        return this._suffix;
    }

    set suffix(value) {
        this._suffix = value;
    }

    // get valid() {
    //     let numInvalid = 0;
    //     const rv = el => {
    //         if (el.reportValidity) {
    //             try {
    //                 if (!el.reportValidity()) {
    //                     numInvalid++;
    //                 }
    //             }
    //             catch { }
    //         }
    //     };
    //     rv(this.htmlElement);
    //     console.debug("ExoTextControl valid", DOM.elementToString(this.htmlElement), numInvalid === 0)
    //     return numInvalid === 0;
    // }

    set autocomplete(obj) {
        this._autoComplete = new ExoTextControlAutoCompleteExtension(this, obj);
    }

    get autocomplete() {
        return this._autoComplete;
    }

}

export default ExoTextControl;
