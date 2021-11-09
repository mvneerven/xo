import ExoInputListControl from './ExoInputListControl';

class ExoRadioButtonListControl extends ExoInputListControl {
    optionType = "radio";

    constructor(context) {
        super(context);
    }

    set value(data) {
        this._value = data;
        this.htmlElement.querySelectorAll("[name]").forEach(el => {
            if (el.value == data)
                el.checked = true;
        });
    }

    get value() {
        let inp = this.htmlElement.querySelector("[name]:checked");
        this._value = inp ? inp.value : "";
        return this._value;
    }

    isItemSelected(item){
        let i = super.isItemSelected(item);
        return i || this._value === (item?.value || item)
    }
}

export default ExoRadioButtonListControl;