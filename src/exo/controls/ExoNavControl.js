import DOM from "../../pwa/DOM";
import ExoDivControl from "./base/ExoDivControl";

class ExoNavControl extends ExoDivControl {
    _controls = [];

    constructor() {
        super(...arguments);

        this.acceptProperties(
            {
                name: "controls",
                type: Array
            },
            {
                name: "submit",
                type: Boolean,
                default: true
            }
        )
    }

    mapAcceptedProperties() {
        const me = this;

        // default controls are defined in current navigation
        this._controls = this.context.exo.addins?.navigation?.controls;

        super.mapAcceptedProperties();

        this.controls?.forEach(field => {
            if (field.name !== "send" || me.submit)
                this._children.push(this.createChild(field))
        });
    }

    get controls() {
        return this._controls;
    }

    set controls(data) {
        this._controls = data;
    }

    getContainerTemplate(obj) {
        return /*html*/`<div class="exf-cnt exf-nav-cnt"><span data-replace="true"></span></div>`;
    }

    async render() {
        await super.render();

        for (let child of this.children) {
            let span = document.createElement("span");
            this.container.appendChild(span)
            let elm = await child.render();
            DOM.replace(span, elm);
        };

        return this.container;
    }

}

export default ExoNavControl;