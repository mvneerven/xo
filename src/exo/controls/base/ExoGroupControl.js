import DOM from "../../../pwa/DOM";
import ExoDivControl from "./ExoDivControl";

class ExoGroupControl extends ExoDivControl {

    _fields = [];

    constructor() {
        super(...arguments);

        this.acceptProperties(
            {
                name: "fields",
                type: Array
            },
            {
                name: "view",
                type: String,
                description: "Set the view mode (inline, block)"
            },
        );
    }

    mapAcceptedProperties() {
        super.mapAcceptedProperties();

        this.fields.forEach(field => {
            this._children.push(this.createChild(field))
        });
    }

    async render() {
        await super.render();
        this.htmlElement.remove(); // no need for standard DIV element 

        this.container.classList.add("exf-std-lbl");
        let div = this.container.querySelector(".exf-inp");

        this.children.forEach(async control => {
            let dummy = document.createElement("span");
            div.appendChild(dummy);

            let elm = await control.render();

            DOM.replace(dummy, elm);

        });

        switch (this.view) {

            case "inline":
                this.container.classList.add("horizontal");
                break;
            default:
                this.container.classList.add("block");
                break;
        }
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