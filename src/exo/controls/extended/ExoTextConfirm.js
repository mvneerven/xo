import ExoTextControl from "../base/ExoTextControl";

/**
 * Extends textbox and shows button to confirm value
 */
class ExoTextConfirm extends ExoTextControl {

    constructor() {
        super(...arguments);

        this.acceptProperties(
            {
                name: "confirmButton",
                type: Object,
                description: "Button properties",
                default: {
                    caption: "Confirm"
                }
            }
        )
    }

    async render() {

        await super.render();

        this.button = await xo.form.run({ // allow custom properties on confirm button
            ...this.confirmButton,
            type: "button",
            name: this.name + "_btn",
            disabled: true
        })
        

        this.htmlElement.addEventListener("input", e => {
            
            this.updateState(e.target.value)

            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
        });
        this.htmlElement.addEventListener("change", e => {
            if (!e.detail || !e.detail.fromClick) { // only propagate change when it comes from confirm (button or Enter)
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
            this.container.classList[this.htmlElement.value ? "add" : "remove"]("exf-std-lbl")
        });

        this.container.querySelector(".exf-ctl").appendChild(this.button);
        this.button.addEventListener("click", e => {
            var evt = new Event("change", {bubbles: true, cancelable: true})
            evt.detail = { fromClick: true };
            this.htmlElement.dispatchEvent(evt);
            this.htmlElement.value = ""; // clear when confirmed
            this.updateState(this.htmlElement.value)
        })

        this.htmlElement.addEventListener("keypress", e => {
            if (e.code === "Enter") {
                this.button.click()
            }
        });

        return this.container
    }

    updateState(value){
        this.button.classList[value !== "" ? "remove" : "add"]("exf-disabled")
        this.button.disabled = value === "";
    }
}

export default ExoTextConfirm;