import DOM from '../../../pwa/DOM';
import Core from '../../../pwa/Core';
import ExoAceCodeEditor from './ExoAceCodeEditor';

class ExoSchemaEditorAce extends ExoAceCodeEditor {

    interval = null;
    focused = 0;
    throttleInterval = 400;
    events = new Core.Events(this);

    async render() {
        await super.render();
        const me = this;
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

        this.ace.on("focus", e => {
            this.focused++;
        });

        this.ace.on("change", e => {
            this.hasChanged = true;
            clearInterval(this.interval);
            this.interval = setInterval(() => {
                if (this.hasChanged) {
                    me.events.trigger("SchemaReady");
                    me.hasChanged = false;

                    let data = me.ace.getValue();
                    if (data.length > 10) {
                        let contentType = me.checkAceMode(data);
                        if (contentType !== this.mode)
                            me.mode = contentType;
                    }
                }
            }, this.throttleInterval);
        })
        return this.container;
    }

    set value(value) {
        const me = this;
        try {
            let sch = this.context.exo.context.createSchema();
            sch.parse(value);
            this.mode = sch.type;
            super.value = sch.toString(this.mode);

            if (me.events)
                me.events.trigger("SchemaReady");

        }
        catch (ex) {
            super.value = value;
        }
    }

    get value() {
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

export default ExoSchemaEditorAce;