import ExoDivControl from './ExoDivControl';
import ExoFormFactory from '../../core/ExoFormFactory';
import DOM from '../../../pwa/DOM';

class ExoFormPageControl extends ExoDivControl {

    _fields = [];

    constructor() {
        super(...arguments);


        this._useContainer = false; // no container by default
        this._isPage = true;
        this._relevant = true;
        this._previouslyRelevant = true;

        this.acceptProperties(
            {
                name: "relevant",
                description: "Specifies whether the page is currently relevant/in scope",
                type: Boolean
            },

            {
                name: "fields",
                description: "Array of fields in the page",
                type: Array
            }
        )

        
    }

    mapAcceptedProperties(){
        super.mapAcceptedProperties();

        this.fields.forEach(field => {
            this._children.push(this.createChild(field))
        });
    }

    async render() {

        await super.render();
        this._setRelevantState();

        this.children.forEach(async child => {
            let span = document.createElement("span");
            this.htmlElement.appendChild(span)
            let elm = await child.render();
            DOM.replace(span, elm);
        });
        return this.container;
    }

    get fields() {
        return this._fields
    }

    set fields(value) {
        this._fields = value;
    }

    set relevant(value) {

        if (value !== this._previouslyRelevant) {
            this._relevant = value;
            if (this.container) {
                this._setRelevantState();
            }
            this._previouslyRelevant = this._relevant;
        }
    }

    get relevant() {
        return this._relevant
    }

    _setRelevantState() {
        if (this.relevant) {
            this.container.removeAttribute("data-skip");
        }
        else {
            console.debug("ExoFormBaseControls: page", this.index, "not relevant")
            this.container.setAttribute("data-skip", "true");
        }

        this.context.exo.events.trigger(ExoFormFactory.events.pageRelevancyChange, {
            index: this.index,
            relevant: this.relevant
        });
    }

    finalize() { }
}

export default ExoFormPageControl;