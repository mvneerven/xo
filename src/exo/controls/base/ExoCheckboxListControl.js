import ExoInputListControl from './ExoInputListControl';

class ExoCheckboxListControl extends ExoInputListControl {

    optionType = "checkbox";

    static returnValueType = Array;

    get value() {
        let ar = [];
        this.container.querySelectorAll(":checked").forEach(i => {
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

            if (this.rendered) {
                this.container.querySelectorAll("[name]").forEach(i => {
                    i.checked = Array.isArray(this._value) ? this._value.find(j => { // use find instead of direct .includes() call
                        return i.value == j; // do loose comparison to account for numeric/string matches
                    }) : false
                });
            }
        }
    }

}

export default ExoCheckboxListControl;