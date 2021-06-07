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
            type: String,
            description: "Prefix to display in input (e.g. '$')"
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
            this.htmlElement.closest(".exf-ctl").setAttribute("data-prefix", this.prefix)
            this.container.classList.add("exf-std-lbl");

            let pfx = document.createElement("span");
            pfx.innerText = this.prefix;
            pfx.style = "position: absolute; top: .25rem; left: 0"
            this.container.appendChild(pfx);
            this.htmlElement.style.paddingLeft = "1rem";
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

        if (this.rendered)
            this.htmlElement.closest(".exf-ctl").setAttribute("data-prefix", this._prefix);
    }

    set autocomplete(obj) {
        this._autoComplete = new ExoTextControlAutoCompleteExtension(this, obj);
    }

    get autocomplete() {
        return this._autoComplete;
    }

}

export default ExoTextControl;
