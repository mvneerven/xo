import ExoBaseControls from '../base';
import DOM from '../../../pwa/DOM';
import 'regenerator-runtime/runtime'; // included for babel build 
class ExoMonacoEditor extends ExoBaseControls.controls.div.type {

    mode = "html";
    theme = "vs-light";

    static returnValueType = String;

    constructor(context) {
        super(context);

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
            }
        );
    }

    async render() {
        
        await super.render();

        // _.context.field.setCurrentValue = (value) => {
        //     _.context.field.value = value;

        //     Core.waitFor(() => {
        //         return _.htmlElement.data && _.htmlElement.data.editor;
        //     }, 1000).then(() => {
        //         _.htmlElement.data.editor.getModel().setValue(value);
        //     });
        // };

        // _.context.field.getCurrentValue = () => {
        //     let value = this.context.field.value;
        //     if (_.htmlElement.data.editor) {
        //         value = _.htmlElement.data.editor.getModel().getValue();
        //     }
        //     return value;
        // };

        var observer = new IntersectionObserver(
            (entries, observer) => {
                if (this.htmlElement.parentNode.offsetHeight) {
                    observer = null;
                    this.initMonacoEditor();
                }
            },
            { root: document.documentElement }
        );
        observer.observe(this.htmlElement);
        return this.htmlElement;
    }

    initMonacoEditor() {
        const _ = this;

        if (_.isInitalized) return;

        const me = _.htmlElement;
        me.style = "min-height: 200px; width: 100%";

        (async () => {
            window.require = { paths: { 'vs': 'scripts/monaco/vs' } };
        
            await import('https://unpkg.com/monaco-editor@0.8.3/min/vs/loader.js');
            await import('https://unpkg.com/monaco-editor@0.8.3/min/vs/editor/editor.main.nls.js');
        
            require(["https://unpkg.com/monaco-editor@0.8.3/min/vs"], () => {
                //monaco.languages.register("javascript");
                //monaco.languages.setMonacrchTokenProvider(...);
                //monaco.editor.defineTheme(...);
        
            });
        })();


        // DOM.require("https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.30.0/min/vs/editor/editor.main.js", ()=>{
        //     require.config({ paths: { "vs": "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.30.0/min/vs/" }});

        //     window.MonacoEnvironment = {
        //         getWorkerUrl: function(workerId, label) {
        //             return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
        //                 self.MonacoEnvironment = { baseUrl: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.30.0/min/" };
        //                 importScripts("https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.30.0/min/vs/base/worker/workerMain.min.js");`
        //             )}`;
        //         }
        //     };

        //     require(["vs/editor/editor.main"], function () {
        //         // Create the editor with some sample JavaScript code
        //         var editor = monaco.editor.create(document.getElementById("editor"), {
        //             value: "// code goes here\n",
        //             language: "javascript"
        //         });

        //         // Resize the editor when the window size changes
        //         const editorElement = document.getElementById("editor");
        //         window.addEventListener("resize", () => editor.layout({
        //             width: editorElement.offsetWidth,
        //             height: editorElement.offsetHeight
        //         }));
        //     });
        // })
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


export default ExoMonacoEditor;