
import ExoAceCodeEditor from './ExoAceCodeEditor';
import ExoSchemaEditor from './ExoSchemaEditor';
import ExoSchemaViewer from './ExoSchemaViewer';
import ExoMonacoEditor from './ExoMonacoEditor';

class ExoDevControls {
    static controls = {
        aceeditor: { type: ExoAceCodeEditor, note: "Wrapper around the Ace code editor - see https://ace.c9.io/", demo: { mode: "html", demo: {value: `<!DOCTYPE html><html></html>`} } },
        xoformeditor: {type: ExoSchemaEditor, note: "XO Schema Editor", demo: {value: `const schema = {pages: [{fields: [{type: "text", name: "txt1", caption: "Test field"}]}]}`}},
        xoviewer: {type: ExoSchemaViewer},
        //monacoeditor: {type: ExoMonacoEditor }
    }
}

export default ExoDevControls;