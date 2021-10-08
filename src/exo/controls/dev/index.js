
import ExoAceCodeEditor from './ExoAceCodeEditor';
import ExoSchemaEditor from './ExoSchemaEditor';

class ExoDevControls {
    static controls = {
        aceeditor: { type: ExoAceCodeEditor, note: "Wrapper around the Ace code editor - see https://ace.c9.io/", demo: { mode: "html" } },
        xoformeditor: {type: ExoSchemaEditor}
    }
}

export default ExoDevControls;