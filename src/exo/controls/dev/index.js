
import ExoAceCodeEditor from './ExoAceCodeEditor';
import ExoSchemaEditorAce from './ExoSchemaEditorAce';
import ExoSchemaViewer from './ExoSchemaViewer';
import ExoMonacoEditor from './ExoMonacoEditor';
import ExoSchemaEditor from './ExoSchemaEditor'

class ExoDevControls {
    static controls = {
        aceeditor: { type: ExoAceCodeEditor, note: "Wrapper around the Ace code editor - see https://ace.c9.io/", demo: { mode: "html", value: `<!DOCTYPE html><html></html>`} },
        "xoformeditor-ace": {type: ExoSchemaEditorAce, note: "XO Schema Editor - based on Ace Editor", demo: {value: `const schema = {pages: [{fields: [{type: "text", name: "txt1", caption: "Test field"}]}]}`}},
        xoformeditor: {type: ExoSchemaEditor, note: "XO Schema Editor - based on Monaco Editor", demo: {value: `const schema = {pages: [{fields: [{type: "text", name: "txt1", caption: "Test field"}]}]}`}},
        xoviewer: {type: ExoSchemaViewer},
        monacoeditor: {type: ExoMonacoEditor, note: "Wrapper around Microsoft Monaco Editor, the editor in VS Code - see https://microsoft.github.io/monaco-editor/" }
    }
}

export default ExoDevControls;