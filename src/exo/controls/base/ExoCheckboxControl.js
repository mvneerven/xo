import ExoCheckboxListControl from './ExoCheckboxListControl';

class ExoCheckboxControl extends ExoCheckboxListControl {

    text = "";

    static returnValueType = Boolean;

    constructor() {
        super(...arguments);

        this.acceptProperties({
            name: "text",
            description: "Text to display on checkbox label"
        });


    }

    mapAcceptedProperties() {
        
        super.mapAcceptedProperties();

        this.items = [
            {
                name: this.text || this.context.field.caption || "Checkbox",
                value: "true",
                //checked: this.value,
                tooltip: this.tooltip || ""
            }
        ]

    }

    async render() {
        if (!this.text) {
            this.context.field.caption = "";
        }
        else {
            this.context.field.class = ((this.context.field.class || "") + " exf-std-lbl").trim();
        }

        console.log("Rendering checkbox with checked " + this.value);

        this.items[0].checked = this.value;

        await super.render();
        this._rendered = true;
        return this.container;
    }

    get value() {
        return this.rendered
            ? this.htmlElement.querySelector(":checked") ? true : false
            : this._checked
    }

    set value(data) {
        if (this.rendered)
            this.htmlElement.querySelector("[name]").checked = data;
        else
            this._checked = data;
    }

    get baseType() {
        return "bool"
    }
}

export default ExoCheckboxControl;