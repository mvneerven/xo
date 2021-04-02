import ExoBaseControls from './ExoBaseControls';
import Core from '../pwa/Core';
import DOM from '../pwa/DOM';

class ExoAceCodeEditor extends ExoBaseControls.controls.div.type {
    mode = "html";
    theme = "chrome";

    constructor(context) {
        super(context);
        this.htmlElement.data = {};


        if (document.querySelector("html").classList.contains("theme-dark")) {
            this.theme = "ambiance";
        }

    }

    async render() {
        const _ = this;
        await super.render();
        const me = _.htmlElement;

        _.context.field.getCurrentValue = () => {
            return _.htmlElement.data.editor.getValue();
        }

        _.context.field.setCurrentValue = value => {
            _.htmlElement.data.editor.setValue(value, -1);
        }

        return new Promise((resolve, reject) => {
            DOM.require("https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.js", () => {
                var editor = ace.edit(_.htmlElement);
                editor.setTheme("ace/theme/" + _.theme);
                editor.session.setMode("ace/mode/" + _.mode);

                _.htmlElement.style = "min-height: 200px; width: 100%"

                if (typeof (_.value) === "string" && _.value.length) {
                    editor.setValue(_.value, -1);
                }

                _.htmlElement.setAttribute('data-evtarget', "true"); // set div as event target 

                editor.on("change", e => {
                    setTimeout(() => {
                        DOM.trigger(_.htmlElement, "change", {
                            target: _.htmlElement
                        })
                    }, 10);

                })

                _.htmlElement.data["editor"] = editor;


                resolve(_.container);
            });
        })
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

        if (this.context.field.value) {
            this.value = this.context.field.value;
            delete this.context.field.value;
        }

        super.setProperties();
    }
}

class ExoMonacoCodeEditor extends ExoBaseControls.controls.div.type {
    mode = "html";
    theme = "vs-light";

    async render() {
        const _ = this;
        await super.render();

        _.context.field.setCurrentValue = value => {
            _.context.field.value = value;

            Core.waitFor(() => {
                return _.htmlElement.data && _.htmlElement.data.editor;
            }, 1000).then(() => {
                _.htmlElement.data.editor.getModel().setValue(value);

            })
        }

        _.context.field.getCurrentValue = () => {
            let value = this.context.field.value;
            if (_.htmlElement.data.editor) {
                value = _.htmlElement.data.editor.getModel().getValue();
            }
            return value;
        }

        var observer = new IntersectionObserver((entries, observer) => {
            if (_.htmlElement.parentNode.offsetHeight) {
                observer = null;
                _.initMonacoEditor();
            }
        }, { root: document.documentElement });
        observer.observe(_.htmlElement);
        return _.htmlElement;
    }

    initMonacoEditor() {
        const _ = this;

        if (_.isInitalized) return;

        const me = _.htmlElement;
        me.style = "min-height: 200px; width: 100%";

        DOM.require("https://unpkg.com/monaco-editor@0.8.3/min/vs/loader.js", () => {

            require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@0.8.3/min/vs' } });
            window.MonacoEnvironment = { getWorkerUrl: () => proxy };

            let proxy = URL.createObjectURL(new Blob([`
                    self.MonacoEnvironment = {
                        baseUrl: 'https://unpkg.com/monaco-editor@0.8.3/min/'
                    };
                    importScripts('https://unpkg.com/monaco-editor@0.8.3/min/vs/base/worker/workerMain.js');
                `], { type: 'text/javascript' }));

            require(["vs/editor/editor.main"], function () {
                let editor = monaco.editor.create(me, {
                    value: _.value || "",
                    language: _.mode,
                    theme: _.theme
                });

                me.data.editor = editor;

                _.isInitalized = true;

                editor.addListener('didType', () => {
                    _.value = editor.getValue();
                    DOM.trigger(me, "change", { target: me })
                });


            });
        });
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

        if (this.context.field.value) {
            this.value = this.context.field.value;
            delete this.context.field.value;
        }

        super.setProperties();
    }
}

class ExoDevControls {
    static controls = {
        aceeditor: { type: ExoAceCodeEditor, note: "Ace code editor", demo: { mode: "html" } },
        monacoeditor: { type: ExoMonacoCodeEditor, note: "Monaco - Visual Studio Code - editor", demo: { mode: "html", theme: "vs-light", value: '<html>\n</html>' } }
    }
}

export default ExoDevControls;