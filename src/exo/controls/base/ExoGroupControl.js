import ExoDivControl from "./ExoDivControl";

class ExoGroupControl extends ExoDivControl {

    _controls = [];

    constructor() {
        super(...arguments);

        this.acceptProperties(
            {
                name: "controls",
                type: Array
            }
        );
    }

    async render() {
        await super.render();

        this.controls.forEach(async control => {
            this.container.appendChild(await xo.form.run(control, {
                parentControl: this,
                context: this.context.context
            }))

        })
        return this.container
    }

    get controls() {
        return this._controls;
    }

    set controls(data) {
        this._controls = data;
    }
}

export default ExoGroupControl;