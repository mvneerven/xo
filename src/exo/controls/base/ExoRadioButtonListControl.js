import ExoInputListControl from './ExoInputListControl';

class ExoRadioButtonListControl extends ExoInputListControl {
    optionType = "radio";

    constructor(context) {
        super(context);
    }

    set value(data) {
        let inp = this.htmlElement.querySelectorAll("[name]").forEach(el => {
            if (el.value == data)
                el.checked = true;
        });
    }

    get value() {
        let inp = this.htmlElement.querySelector("[name]:checked");
        return inp ? inp.value : "";
    }
}

export default ExoRadioButtonListControl;