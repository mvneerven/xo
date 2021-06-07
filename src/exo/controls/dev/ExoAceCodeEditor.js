import ExoBaseControls from '../base/ExoBaseControls';
import DOM from '../../../pwa/DOM';

class ExoAceCodeEditor extends ExoBaseControls.controls.div.type {
    _mode = "html";

    defaultThemes = {
        dark: "ambiance",
        light: "chrome"
    }

    _fontSize = 14;

    static returnValueType = String;

    constructor(context) {
        super(context);
        this.htmlElement.data = {};

        this.acceptProperties(
            { name: "mode", type: String, description: "Ace Editor mode - refer to Ace documentation" },
            { name: "theme", type: String, description: "Ace Editor theme - refer to Ace documentation" },
            { name: "fontSize", type: Number }
        )

        this.theme = document.querySelector("html").classList.contains("theme-dark") ? this.defaultThemes.dark : this.defaultThemes.light;

    }

    async render() {

        await super.render();

        return new Promise((resolve, reject) => {
            DOM.require("https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.js", () => {

                var editor = ace.edit(this.htmlElement);
                editor.setTheme("ace/theme/" + this.theme);
                editor.session.setMode("ace/mode/" + this.mode);

                this.htmlElement.style = "min-height: 200px; width: 100%; font-size: " + this.fontSize + "px;";


                if (typeof (this.value) === "string" && this.value.length) {
                    editor.setValue(this.value, -1);
                }

                this.htmlElement.setAttribute('data-evtarget', "true"); // set div as event target 
                editor.on("change", e => {
                    setTimeout(() => {
                        DOM.trigger(this.htmlElement, "change", {
                            target: this.htmlElement
                        })
                    }, 10);

                })
                this.htmlElement.data.editor = editor;

                if (this.htmlElement.classList.contains("full-height")) {
                    this.container.classList.add("full-height");
                    let cc = this.container.querySelector(".exf-ctl");
                    if (cc)
                        cc.classList.add("full-height");
                }

                resolve(this.container);
            });
        })
    }

    get mode() {
        return this._mode;
    }

    set mode(value) {
        this._mode = value;
        if (this.ace)
            this.ace.session.setMode("ace/mode/" + this._mode);
    }

    get value() {
        if (this.ace)
            return this.ace.getValue();

        return this.context.field.value;
    }

    set fontSize(value) {
        this._fontSize = value;
        ace.config.set("fontSize", this._fontSize + "px;");
        this.htmlElement.style.fontSize = this._fontSize + "px;"
    }

    get fontSize() {
        return this._fontSize;
    }

    set value(data) {
        data = data || "";
        this.context.field.value = data;
        if (this.ace)
            this.ace.setValue(data, -1);
    }

    get ace() {
        if (this.htmlElement.data && this.htmlElement.data.editor)
            return this.htmlElement.data.editor;

        return null;
    }

    setProperties() {

        if (this.context.field.mode) {
            this.mode = this.context.field.mode;
            delete this.context.field.mode;
        }

        if (this.context.field.theme) {
            this.theme = this.context.field.theme;
            delete this.context.field.theme;
        }

        // if (this.context.field.value) {
        //     this.value = this.context.field.value;
        //     delete this.context.field.value;
        // }

        super.setProperties();
    }
}

export default ExoAceCodeEditor;