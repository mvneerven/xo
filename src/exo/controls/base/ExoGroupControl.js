import xo from "../../../../js/xo";
import ExoDivControl from "./ExoDivControl";

class ExoGroupControl extends ExoDivControl {

    _fields = [];

    constructor() {
        super(...arguments);

        this.acceptProperties(
            {
                name: "fields",
                type: Array
            }
        );
    }

    async render() {
        await super.render();
        this.container.classList.add("exf-std-lbl");
        let div = document.createElement("div");
        this.container.querySelector(".exf-ctl").appendChild(div);
        this.fields.forEach(control => {
            let dummy = document.createElement("span");
            div.appendChild(dummy);
            xo.form.run(control, {
                parentControl: this,
                context: this.context.context
            }).then(ctl => {
                xo.dom.replace(dummy, ctl)
            })
        })
        return this.container
    }

    get fields() {
        return this._fields;
    }

    set fields(data) {
        this._fields = data;
    }
}

export default ExoGroupControl;