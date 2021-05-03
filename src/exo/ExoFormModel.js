
import ExoForm from './ExoForm';


class ExoFormModel {
    _data = {};

    constructor(exo) {
        this.exo = exo;

        if (exo.formSchema.model) {
            this._data = exo.formSchema.model;
        }
        else {
            this._data = this.exo.getFormValues();
        }
        console.log("Model", this._data);

    }
}

export default ExoFormModel;
