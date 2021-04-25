import ExoBaseControls from './ExoBaseControls';
import Core from '../pwa/Core';
import DOM from '../pwa/DOM';

class ExoAceCodeEditor extends ExoBaseControls.controls.div.type {
    mode = "html";
    theme = "chrome";

    static returnValueType = String;

    constructor(context) {
        super(context);
        this.htmlElement.data = {};

        this.acceptProperties(
            { name: "mode", type: String, description: "Ace Editor mode - refer to Ace documentation" },
            { name: "theme", type: String, description: "Ace Editor theme - refer to Ace documentation" }
        )

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
                
                ace.config.set("fontSize", "14px");

                var editor = ace.edit(_.htmlElement);

                //var beautify = ace.require("ace/ext/beautify"); // get reference to extension

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

                // var staticWordCompleter = {
                //     getCompletions: function(editor, session, pos, prefix, callback) {
                //         var wordList = ["foo", "bar", "baz"];
                //         callback(null, wordList.map(function(word) {
                //             return {
                //                 caption: word,
                //                 value: word,
                //                 meta: "static"
                //             };
                //         }));
                
                //     }
                // }
                
                // editor.completers = [staticWordCompleter]

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


class ExoDevControls {
    static controls = {
        aceeditor: { type: ExoAceCodeEditor, note: "Ace code editor", demo: { mode: "html" } }

    }
}

export default ExoDevControls;