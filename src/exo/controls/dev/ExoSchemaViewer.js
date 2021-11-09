
import xo from '../../../../js/xo';
import ExoFormFactory from '../../core/ExoFormFactory';
import ExoMultiInputControl from '../extended/ExoMultiInputControl';

class ExoSchemaViewer extends ExoMultiInputControl {

    columns = ".5fr .5fr";
    areas = `"code view"`;

    async render() {

        this.fields = {
            code: { caption: "Code", type: "xoformeditor", bind: this.bind, value: this.value, class: "full-height" },
            view: { caption: "View", type: "sandbox" }
        }

        await super.render();

        this.editor = ExoFormFactory.getFieldFromElement(this.inputs["code"])._control;
        this.sandbox = ExoFormFactory.getFieldFromElement(this.inputs["view"])._control;

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