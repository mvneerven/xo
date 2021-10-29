import DOM from '../../../pwa/DOM';
import ExoAceCodeEditor from './ExoAceCodeEditor';

class ExoSchemaEditor extends ExoAceCodeEditor {

    constructor(){
        super(...arguments);
        this.mode = "js";
    }

    async render() {
        await super.render();


        this.modeSwitch = DOM.parseHTML('<div title="Switch js/json" style="cursor: pointer; position:absolute; top: 10px; right: 30px">' + this.mode + '</div>');
        this.modeSwitch.addEventListener("click", e => {
            this.mode = this.mode === "javascript" ? "json" : "javascript";

            let contentType = this.checkAceMode(this.value);

            if (this.mode !== contentType) {
                this.convertValue(this.mode);
            }
            this.modeSwitch.innerText = this.mode;
        });

        this.container.appendChild(this.modeSwitch)

        this.ace.on("change", e => {
            let data = this.ace.getValue();
            if (data.length > 10) {
                let contentType = this.checkAceMode(data);
                if (contentType !== this.mode)
                    this.mode = contentType;
            }
        })

        return this.container;
    }

    set value(value) {

        try {
            let sch = this.context.exo.context.createSchema();
            sch.parse(value);
            this.mode = sch.type;
            super.value = sch.toString(this.mode)
        }
        catch (ex) {
            console.error("ExoFormAceExtension.schema setter", ex)
            super.value = value;
        }
    }

    get value(){
        return super.value;
    }

    set mode(value) {
        super.mode = value;

        if (this.modeSwitch)
            this.modeSwitch.innerText = value;
    }

    get mode() {
        return super.mode;
    }

    checkAceMode(value) {

        if (typeof (value) == "string") {
            if (value.length > 6 && value.startsWith("const ")) {
                return "javascript"
            }
            else if (value.startsWith("{")) {
                return "json"
            }
        }
        else if (typeof (value) === "object") {
            if (typeof (value.model?.logic) === "function")
                return "javascript"

            return "json";
        }
        throw TypeError("Unknown ace mode: " + value);
    }

    convertValue(targetMode) {
        const xs = xo.form.factory.Schema.read(this.value)
        this.value = xs.toString(targetMode);
    }


}

export default ExoSchemaEditor;