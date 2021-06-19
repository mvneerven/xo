import ExoInputControl from './ExoInputControl';
import DOM from '../../../pwa/DOM';
import ExoTextControlAutoCompleteExtension from './ExoTextControlAutoCompleteExtension';

class ExoTextControl extends ExoInputControl {
    constructor(context) {
        super(context);

        this.isTextInput = true;
        this.htmlElement = DOM.parseHTML('<input type="text"/>');

        this.acceptProperties({
            name: "prefix",
            type: Object,
            description: `Prefix to display in input (e.g. '$'). 
                Use object notation to specify icon or font. 
                - prefix: {char: "◷", font: "Segoe UI"}
                - prefix: {icon: "ti-search"}`

        },
            {
                name: "autocomplete",
                description: "Object with autocomplete settings",
                type: Object
            });
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


        if (this.prefix) {
            //this.htmlElement.closest(".exf-ctl").setAttribute("data-prefix", this.prefix)
            this.container.classList.add("exf-std-lbl");
            let pos = "";
            let pfx = document.createElement("span");
            if (this.prefix.icon) {
                pfx.classList.add(this.prefix.icon);
                pos = "top: .65rem; left: 0.5rem";
            }
            else {
                pfx.innerHTML = this.prefix.char ? this.prefix.char : this.prefix;
                pos = "top: .45rem; left: 0.5rem";
            }

            pfx.style = `position: absolute; ${pos}; ${(this.prefix.font ? "font-family: "
                + this.prefix.font : "")}; ${(this.prefix.size ? "font-size: " + this.prefix.size + "; line-height: " + this.prefix.size : "")}`;

            this.container.appendChild(pfx);
            this.htmlElement.style.paddingLeft = "2rem";
        }

        if (this.autocomplete) {
            this.autocomplete.attach();
        }

        return this.container;
    }

    get prefix() {
        return this._prefix;
    }

    set prefix(value) {
        this._prefix = value;

        // if (this.rendered)
        //     this.htmlElement.closest(".exf-ctl").setAttribute("data-prefix", this._prefix);
    }

    set autocomplete(obj) {
        this._autoComplete = new ExoTextControlAutoCompleteExtension(this, obj);
    }

    get autocomplete() {
        return this._autoComplete;
    }

}

export default ExoTextControl;
