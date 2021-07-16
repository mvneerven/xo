import ExoNumberControl from './ExoNumberControl';
import DOM from '../../../pwa/DOM';

class ExoRangeControl extends ExoNumberControl {

    showoutput = false;

    static returnValueType = Number;

    constructor(context) {
        super(context);

        //this.context.field.type = "range";
        this.htmlElement = DOM.parseHTML(`<input name="${this.context.field.name}" type="range"/>`);

        this.acceptProperties({
            name: "showoutput",
            type: Boolean,
            demoValue: true,
            description: "Shows current value"
        })
    }

    async render() {

        await super.render();

        if (this.showoutput) {
            this.output = document.createElement("output");

            this.htmlElement.parentNode.insertBefore(this.output, this.htmlElement.nextSibling);
            this.htmlElement.addEventListener("input", this._sync);
            this._sync();
            this.container.classList.add("exf-rng-output")
        }

        // force outside label rendering
        this.container.classList.add("exf-std-lbl");

        return this.container;
    }

    _sync(e) {
        
        if(e){
            this.output = e.target.nextSibling;
            this.htmlElement = e.target
        }

        if (this.output && this.htmlElement)
            this.output.value = this.htmlElement.value;
    }

    set value(data) {
        super.value = data;
        if (this.showoutput)
            this._sync()
    }
}


export default ExoRangeControl;