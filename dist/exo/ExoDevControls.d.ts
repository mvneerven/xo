export default ExoDevControls;
declare class ExoDevControls {
    static controls: {
        aceeditor: {
            type: typeof ExoAceCodeEditor;
            note: string;
            demo: {
                mode: string;
            };
        };
    };
}
declare const ExoAceCodeEditor_base: typeof import("./ExoBaseControls").ExoDivControl;
declare class ExoAceCodeEditor extends ExoAceCodeEditor_base {
    static returnValueType: StringConstructor;
    mode: string;
    theme: string;
    value: any;
}
