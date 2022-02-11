import DOM from '../../../pwa/DOM';
import Core from '../../../pwa/Core';
import ExoMonacoCodeEditor from './ExoMonacoEditor';
import xo from '../../../../js/xo';

class ExoSchemaEditor extends ExoMonacoCodeEditor {

    interval = null;
    focused = 0;

    throttleInterval = 400;

    constructor() {
        super(...arguments);
        this._hasValue = true;
        this.on("createEditor", e => {
            //e.detail.editorOptions.minimap.enabled = true
        })
    }

    async render() {
        const me = this;
        await super.render();

        this.modeSwitch = DOM.parseHTML('<div title="Switch js/json" style="cursor: pointer; position:absolute; top: 10px; right: 30px">' + this.mode + '</div>');
        this.modeSwitch.addEventListener("click", e => {

            me.mode = me.mode === "javascript" ? "json" : "javascript";
            me.language = me.mode;

            let contentType = me.checkMode(me.value);

            if (me.mode !== contentType) {
                me.convertValue(me.mode);
            }
            me.modeSwitch.innerText = me.mode;
        });
        
        this.container.appendChild(this.modeSwitch)

        this.on("ready", this.initAutocomplete.bind(this));

        this.on("change", e => {

            this.hasChanged = true;
            clearInterval(this.interval);
            this.interval = setInterval(() => {
                if (this.hasChanged) {
                    me.events.trigger("SchemaReady");
                    me.hasChanged = false;

                    let data = me.value;
                    if (data.length > 10) {
                        let contentType = me.checkMode(data);
                        if (contentType !== this.mode) {
                            me.language = contentType
                        }
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
            me.mode = sch.type;

            if (me.modeSwitch)
                me.modeSwitch.innerText = me.mode;

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

    set language(name) {
        this.mode = name;
        monaco.editor.setModelLanguage(this.editor.getModel(), name);

        if (this.modeSwitch)
            this.modeSwitch.innerText = name;
    }

    get language() {
        return this.mode;
    }

    checkMode(value) {
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


    async initAutocomplete() {
        if (ExoSchemaEditor.autocompleteReady)
            return;

        const me = this;

        // Code completion provider
        const acProvider = {
            triggerCharacters: ['"'],
            provideCompletionItems: async (model, position) => {
                try {
                    let context = me.getSuggestionContext(model, position);
                    return {
                        suggestions: await me.getSuggestions(context)
                    }
                }
                catch (e) {
                    //debugger;
                }
            }
        }

        monaco.languages.registerCompletionItemProvider('javascript', acProvider);
        monaco.languages.registerCompletionItemProvider('json', acProvider);

        // Hover provider
        const hoverProvider = {
            provideHover: function (model, position) {
                // Log the current word in the console, you probably want to do something else here.
                //console.log(model.getWordAtPosition(position));
            }
        }

        // monaco.languages.registerHoverProvider('javascript', hoverProvider);
        // monaco.languages.registerHoverProvider('json', hoverProvider);

        me.preventDefaultJavascriptAutocomplete()

        ExoSchemaEditor.autocompleteReady = true;
    }

    preventDefaultJavascriptAutocomplete() {
        /* 
            Prevent default JavaScript autocompletion
            see https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-configure-javascript-defaults
            and https://stackoverflow.com/questions/41581570/how-to-remove-autocompletions-for-monaco-editor-using-javascript

            It does the trick, but...
                TODO: Make sure this error disappears:
                    >> Uncaught (in promise) Error: Could not find source file: 'inmemory://model/1'.
        */

        // monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        //     diagnosticCodesToIgnore: [1109]
        // })

        monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
            { noLib: true, allowNonTsExtensions: false }
        )

    }

    getSuggestionContext(model, position) {

        let last_chars = model.getValueInRange({ startLineNumber: 1, startColumn: 0, endLineNumber: position.lineNumber, endColumn: position.column });
        //let path = this.getObjectPath(last_chars)
        let text = last_chars.replace(/\s\s+/g, ' ').trim();

        let lastObjStart = last_chars.lastIndexOf("{");
        last_chars = lastObjStart !== -1 ? last_chars.substring(lastObjStart) : last_chars;
        let type;
        let typeDef = last_chars.match(/\s*type\s*:\s*"(\S*)"\s*/gi);
        if (typeDef) {

            const f = new Function("function s(){return c={" + typeDef + "}};return s()");
            type = f().type;
        }

        let words = last_chars.replace("\t", "").replace('"', '').split(" ");
        let active_typing = words[words.length - 1]; // What the user is currently typing (everything after the last space)
        let prev = words[words.length - 2]

        const context = {
            type: type,
            text: text,
            path: this.getPath(text),
            active: active_typing,
            before: prev
        }

        return context;
    }

    getPath(text) {
        text = text.replace(/\s\s+/g, ' ').trim();
        const ar = [];
        const up = (text) => {
            let key;
            let i = text.lastIndexOf('{');
            let j = text.lastIndexOf('[');
            let k = text.lastIndexOf(':');
            let l = text.lastIndexOf(',');
            let m = text.lastIndexOf('}');
            let n = text.lastIndexOf(']');

            if (l > -1) {
                l = Math.max(i, l);
                key = text.substring(l + 2, k).trim();
            }
            if (l !== -1) {

                if (key && key.indexOf(" ") === -1) {
                    //if(key.indexOf(" ")===-1)
                    ar.push(key)
                }
                else {
                    if (i > m) {
                        let fType = /\s*type\s*:\s*"(\S*)"\s*/gi.exec(text.substring(i));
                        if (fType) {
                            ar.push("field:" + fType[1]);
                        }
                    }
                }

                text = text.substring(0, Math.min(i, j))
                up(text)
            }
        }
        up(text)
        return ar.reverse();
    }

    async getSuggestions(options = {}) {
        const ar = [];

        if (options.path.pop() === "fields") {
            Object.entries(this.context.exo.context.library).forEach(i => {
                let key = i[0], data = i[1];
                ar.push({
                    label: key,
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: this.createFieldSnippet(key, data),
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: data.description || key
                })
            })

            return ar;
        }

        else if (options.type) {
            const div = await xo.form.run({
                type: options.type
            });
            let control = xo.control.get(div);
            Object.entries(control.jsonSchema.properties).forEach(i => {
                let propEnclosure = '""';
                switch (i[1].type) {
                    case "string":
                        propEnclosure = '"${1:string}"';
                        break;
                    case "array":
                        propEnclosure = "[${1:}]";
                        break;
                    case "boolean":
                        propEnclosure = "${1:true}";
                        break;
                    case "object":
                    case "number":
                        propEnclosure = "${1:}";
                        break;
                }
                ar.push({
                    label: i[0],
                    kind: monaco.languages.CompletionItemKind.Property,
                    insertText: `${i[0]}: ${propEnclosure}`,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: i[1].description
                })
            })

            return ar;
        }

        if (options.active === "" || options.active === '"') {
            switch (options.before) {
                case "type:":
                    Object.keys(this.context.exo.context.library).forEach(i => {
                        ar.push({
                            label: i,
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: i,
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: i
                        })
                    })
                    break;
                case "theme:":
                    Object.keys(xo.form.factory.meta.theme.type.types).forEach(i => {
                        ar.push({
                            label: i,
                            insertText: i,
                        })
                    });
                    break;
                case "validation:":
                    Object.keys(xo.form.factory.meta.validation.type.types).forEach(i => {
                        ar.push({
                            label: i,
                            insertText: i,
                        })
                    });
                    break;
                case "navigation:":
                    Object.keys(xo.form.factory.meta.navigation.type.types).forEach(i => {
                        ar.push({
                            label: i,
                            insertText: i,
                        })
                    });
                    break;
                default:
                    console.log(options)
            }
        }
        return ar;
    }


    createFieldSnippet(key, data) {
        let f = JSON.stringify;
        if (this.mode === "javascript")
            f = Core.stringifyJs;

        return f({
            type: key,
            caption: xo.core.toWords(key),
            ...data.demo || {}
        }, null, 2)
    }


}

export default ExoSchemaEditor;