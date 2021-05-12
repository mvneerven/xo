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
    _mode: string;
    defaultThemes: {
        dark: string;
        light: string;
    };
    _fontSize: number;
    theme: string;
    set mode(arg: string);
    get mode(): string;
    set fontSize(arg: number);
    get fontSize(): number;
    get ace(): any;
}
