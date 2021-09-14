import xo from "../../../../js/xo";
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

        let btn = await xo.form.run({ // allow custom properties on confirm button
            ...this.confirmButton,
            type: "button",
            name: this.name + "_btn"
        })

        this.htmlElement.addEventListener("input", e => {
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

        this.container.querySelector(".exf-ctl").appendChild(btn);
        btn.addEventListener("click", e => {
            var evt = document.createEvent("HTMLEvents");
            evt.initEvent("change", true, true);
            evt.detail = { fromClick: true };
            this.htmlElement.dispatchEvent(evt);
            this.htmlElement.value = ""; // clear when confirmed
        })

        this.htmlElement.addEventListener("keypress", e => {
            if (e.code === "Enter") {
                btn.click()
            }
        });

        return this.container
    }
}

export default ExoTextConfirm;