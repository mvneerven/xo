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
            }
        );

        
    }

    mapAcceptedProperties(){
        super.mapAcceptedProperties();

        this.fields.forEach(field => {
            this._children.push(this.createChild(field))
        });
    }

    async render() {
        await super.render();
        this.container.classList.add("exf-std-lbl");
        let div = document.createElement("div");
        this.container.querySelector(".exf-inp").appendChild(div);

        this.children.forEach(async control => {
            let dummy = document.createElement("span");
            div.appendChild(dummy);

            let elm = await control.render();

            DOM.replace(dummy, elm);

        });
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