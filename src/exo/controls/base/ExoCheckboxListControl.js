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

    //TODO
    set value(data) {
        
        this.container.querySelectorAll("[name]").forEach(i => {

        });
    }

}

export default ExoCheckboxListControl;