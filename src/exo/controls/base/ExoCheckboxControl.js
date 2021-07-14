import ExoCheckboxListControl from './ExoCheckboxListControl';

class ExoCheckboxControl extends ExoCheckboxListControl {

    text = "";

    static returnValueType = Boolean;

    constructor(context) {
        super(context);

        this.acceptProperties({
            name: "text",
            description: "Text to display on checkbox label"
        });

        this.items = [{ name: this.text || context.field.caption, value: true, checked: context.field.value, tooltip: context.field.tooltip || "" }]
    }

    async render() {
        if (!this.text) {
            this.context.field.caption = "";
        }
        else {
            this.context.field.class = ((this.context.field.class || "") + " exf-std-lbl").trim();
        }

        await super.render();
        return this.container;
    }

    get value() {
        if (this.rendered)
            return this.container.querySelector(":checked") ? true : false;

        return super.value;
    }

    set value(data) {
        super.value = data;
        if (this.rendered)
            this.container.querySelector("[name]").checked = data;
    }
}

export default ExoCheckboxControl;