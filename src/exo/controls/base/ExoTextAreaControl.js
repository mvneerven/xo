import ExoTextControl from './ExoTextControl';
import DOM from '../../../pwa/DOM';

class ExoTextAreaControl extends ExoTextControl {
    autogrow = false;

    constructor(context) {
        super(context);

        this.acceptProperties({
            name: "autogrow",
            type: Boolean,
            description: "Use to automatically expand the typing area as you add lines"
        })


        this.htmlElement = DOM.parseHTML('<textarea/>');
    }

    setProperties() {
        super.setProperties();

        if (this.attributes["value"]) {
            this.htmlElement.innerHTML = this.attributes["value"];
            delete this.attributes["value"];
        }
    }

    async render() {
        await super.render();

        if (this.autogrow) {
            this.htmlElement.setAttribute("onInput", "this.parentNode.dataset.replicatedValue = this.value");
            this.htmlElement.parentNode.classList.add("autogrow");
        }

        return this.container;
    }
}

export default ExoTextAreaControl;