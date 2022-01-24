
import xo from '../../../../js/xo';
import ExoFormFactory from '../../core/ExoFormFactory';
import ExoMultiInputControl from '../extended/ExoMultiInputControl';

class ExoSchemaViewer extends ExoMultiInputControl {

    columns = ".5fr .5fr";
    areas = `"code view"`;


    get fields() {
        return {
            code: { caption: "Code", type: "xoformeditor", bind: "inherit", value: "inherit", class: "full-height" },
            view: { caption: "View", type: "sandbox" }
        }
    }


    set fields(value){
        // NA
    }



    async render() {
        await super.render();

        this.editor = this.controls["code"];
        this.sandbox = this.controls["view"];

        this.editor.on("SchemaReady", this.renderForm.bind(this));
        this.renderForm();

        this.container.classList.add("full-height")
        return this.container;
    }

    async renderForm(e) {
        this.sandbox.form = {
            schema: this.editor.value
        }
    }

    set value(data) {
        this._value = data;
    }

    get value() {
        return this._value;
    }
}

export default ExoSchemaViewer;