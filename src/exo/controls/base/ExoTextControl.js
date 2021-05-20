import ExoInputControl from './ExoInputControl';
import DOM from '../../../pwa/DOM';

class ExoTextControl extends ExoInputControl {
    constructor(context) {
        super(context);

        this.isTextInput = true;
        this.htmlElement = DOM.parseHTML('<input type="text"/>');

        this.acceptProperties({
            name: "prefix",
            type: String,
            description: "Prefix to display in input (e.g. '$')"
        })

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
            pfx.style = "position: absolute; top: .25rem"
            this.container.appendChild(pfx);
            this.htmlElement.style.paddingLeft = "1rem";
        }

        return this.container
    }

    get prefix() {
        return this._prefix;
    }

    set prefix(value) {
        this._prefix = value;

        if (this.rendered)
            this.htmlElement.closest(".exf-ctl").setAttribute("data-prefix", this._prefix)
    }

}

export default ExoTextControl;
