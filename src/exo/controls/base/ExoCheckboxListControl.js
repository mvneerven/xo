import ExoInputListControl from './ExoInputListControl';

class ExoCheckboxListControl extends ExoInputListControl {

    optionType = "checkbox";

    static returnValueType = Array;

    get value() {
        if(!this._rendered)
            return this._value;

        let ar = [];
        this.htmlElement.querySelectorAll(":checked").forEach(i => {
            ar.push(i.value);
        });
        return ar;
    }

    set value(data) {        
        if (!data) {
            this._value = null;
        }
        else {
            this._value = data;
            this.htmlElement.querySelectorAll("[name]").forEach(i => {
                i.checked = Array.isArray(this._value) ? this._value.find(j => { // use find instead of direct .includes() call
                    return i.value == j; // do loose comparison to account for numeric/string matches
                }) : false
            });
        }
    }

}

export default ExoCheckboxListControl;