import ExoInputListControl from './ExoInputListControl';

/**
 * Renders a checkbox list
 */
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
        if(!data){
            this._value = null;
        }
        else{
            this._value = data;

            if(this.rendered){
                this.container.querySelectorAll("[name]").forEach(i => {
                    i.checked = this._value.contains(i.value)
                        
                });
            }
        }
    }

}

export default ExoCheckboxListControl;