import ExoTextControl from './ExoTextControl';

class ExoNumberControl extends ExoTextControl { // ExoInputControl

    buttons = false;

    constructor(context) {
        super(context);

        this.context.field.type = "number";

        this.acceptProperties({
            name: "buttons",
            description: "Add plus and minus buttons",
            type: Boolean
        })
    }

    async render() {
        await super.render();

        if (this.buttons) {

            this.minusButton = document.createElement("button");
            this.minusButton.innerText = "-";
            this.minusButton.classList.add("nmbr-m");
            this.plusButton = document.createElement("button");
            this.plusButton.innerText = "+";
            this.plusButton.classList.add("nmbr-p");


            this.htmlElement.parentNode.insertBefore(this.minusButton, this.htmlElement)
            this.htmlElement.parentNode.insertBefore(this.plusButton, this.htmlElement.nextSibling)

            this.container.classList.add("exf-nmbr-btns");
            this.container.classList.add("exf-std-lbl");

            this.container.addEventListener("click", e => {

                e.cancelBubble = true;
                e.preventDefault();

                let step = parseInt("0" + this.htmlElement.step) || 1;

                if (e.target === this.plusButton) {
                    if (this.htmlElement.max === "" || parseInt(this.htmlElement.value) < parseInt(this.htmlElement.max)) {
                        this.htmlElement.value = parseInt("0" + (this.htmlElement.value || (this.htmlElement.min != "" ? this.htmlElement.min - 1 : -1))) + step;
                    }
                }
                else if (e.target === this.minusButton) {
                    if (this.htmlElement.min === "" || parseInt(this.htmlElement.value) > parseInt(this.htmlElement.min)) {
                        this.htmlElement.value = parseInt("0" + (this.htmlElement.value || (this.htmlElement.max != "" ? this.htmlElement.max - 1 : 1))) - step;
                    }
                }

                this.triggerChange();
            })
        }

        return this.container;
    }

    static returnValueType = Number;
}

export default ExoNumberControl;