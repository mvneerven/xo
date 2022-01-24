import DOM from "../../../pwa/DOM";
import Core from "../../../pwa/Core";
import ExoDivControl from "../base/ExoDivControl";

const MONACO_VERSION = "0.31.1";

class ExoMonacoCodeEditor extends ExoDivControl {
    mode = "html";    
    theme = document.documentElement.classList.contains("theme-dark") ? "vs-dark" : "vs-light";
    events = new Core.Events(this);
    _version = MONACO_VERSION;

    static returnValueType = String;

    constructor() {
        super(...arguments);
        

        this.acceptProperties(
            {
                name: "mode",
                type: String,
                description: "Monaco Editor mode - refer to Monaco documentation"
            },
            {
                name: "theme",
                type: String,
                description: "Monaco Editor theme - refer to Monaco documentation"
            },
            {
                name: "version",
                description: "Monaco editor version. Default: " + MONACO_VERSION,
                type: String
            },

            {
                name: "options",
                description: "Extra Monaco editor options - See https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IEditorConstructionOptions.html",
                type: Object
            }
        );
    }

    mapAcceptedProperties(){
        super.mapAcceptedProperties();
        
        this._hasValue = true;
        this.useContainer = true;
        this.htmlElement = document.createElement("div");
        this.htmlElement.data = { editor: this };
    }

    set version(data) {
        this._version = data;
    }

    get version() {
        return this._version;
    }

    async render() {
        const me = this;

        await super.render();

        //this.htmlElement.style = "min-height: 200px; width: 100%";
        this.container.querySelector(".exf-ctl").appendChild(this.htmlElement)
        this.container.classList.add("exf-std-lbl")

        var observer = new IntersectionObserver((entries, observer) => {
            if (me.htmlElement.parentNode.offsetHeight) {
                observer = null;

                me.initMonacoEditor();
            }
        },
            { root: document.documentElement }
        );
        observer.observe(this.htmlElement);

        return this.container;
    }

    set value(data) {

        if (this._value === data)
            return;

        this._value = data;

        if (this.editor) {
            if (this.editor.getModel().getValue() !== data)
                this.editor.getModel().setValue(data);
        }
    };

    get value() {
        return this.editor?.getModel().getValue() || this._value;
    };
    

    /**
     * @param {String} name
     */
    set mode(name) {
        this._mode = name;
        monaco.editor.setModelLanguage(this.editor.getModel(), name);        
    }

    /**
     * @returns {String}
     */
    get mode() {
        return this._mode;
    }

    get theme() {
        return this._theme;
    }

    set theme(name) {
        this._theme = name;
        if (this.editor)
            this.editor.theme = name;
    }



    initMonacoEditor() {
        const me = this;

        if (me.editor) return;

        DOM.require(`https://unpkg.com/monaco-editor@${me.version}/min/vs/loader.js`, () => {
            require.config({
                paths: { vs: `https://unpkg.com/monaco-editor@${me.version}/min/vs` }
            });
            window.MonacoEnvironment = { getWorkerUrl: () => proxy };

            let proxy = URL.createObjectURL(
                new Blob(
                    [`self.MonacoEnvironment = {
                          baseUrl: 'https://unpkg.com/monaco-editor@${me.version}/min/'
                        };
                        importScripts('https://unpkg.com/monaco-editor@${me.version}/min/vs/base/worker/workerMain.js');`
                    ], { type: "text/javascript" }
                )
            );

            require(["vs/editor/editor.main"], () => {

                const detail = {
                    editorOptions: {
                        value: me.value || "",
                        language: me.mode,
                        theme: me.theme,
                        automaticLayout: true,
                        ...me.options || {}
                    }
                }

                me.events.trigger("createEditor", detail)

                me.editor = monaco.editor.create(me.htmlElement, detail.editorOptions);

                me.events.trigger("ready");

                me.editor.getModel().onDidChangeContent(e => {
                    me.events.trigger("change")
                })
            });
        }
        );
    }

    applyNonMappedFieldSchemaProperties() {
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

        super.applyNonMappedFieldSchemaProperties();
    }
}

export default ExoMonacoCodeEditor