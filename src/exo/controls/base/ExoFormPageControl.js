import ExoDivControl from './ExoDivControl';
import ExoFormFactory from '../../core/ExoFormFactory';

class ExoFormPageControl extends ExoDivControl {

    constructor(context) {
        super(context);

        this._relevant = true;
        this._previouslyRelevant = true;

        this.acceptProperties(
            {
                name: "relevant",
                description: "Specifies whether the page is currently relevant/in scope",
                type: Boolean
            }
        )
    }

    async render() {
        await super.render();

        this._setRelevantState();

        return this.container;
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