export class ExoFormContext {
    constructor(library: any);
    library: any;
    themes: typeof ExoThemes;
    _theme: import("./ExoThemes").Fluent;
    enrichMeta(library: any): any;
    getProps(field: any, type: any, control: any): {
        name: {
            type: string;
            description: string;
        };
        required: {
            type: string;
            description: string;
        };
        caption: {
            type: string;
            description: string;
        };
    };
    createForm(options: any): ExoForm;
    get(type: any): any;
    query(callback: any): any;
    isExoFormControl(formSchemaField: any): boolean;
    renderSingleControl(field: any): Promise<any>;
    createGenerator(): ExoSchemaGenerator;
    set theme(arg: import("./ExoThemes").Fluent);
    get theme(): import("./ExoThemes").Fluent;
}
export default ExoFormFactory;
import ExoThemes from "./ExoThemes";
import ExoForm from "./ExoForm";
import ExoSchemaGenerator from "./ExoSchemaGenerator";
declare class ExoFormFactory {
    static _ev_pfx: string;
    static events: {
        beforePage: string;
        page: string;
        getListItem: string;
        post: string;
        renderStart: string;
        renderReady: string;
        change: string;
        reportValidity: string;
        schemaLoaded: string;
        interactive: string;
    };
    static navigation: typeof ExoFormNavigation;
    static validation: typeof ExoFormValidation;
    static Context: typeof ExoFormContext;
    static defaults: {
        imports: any[];
    };
    static html: {
        classes: {
            formContainer: string;
            pageContainer: string;
            elementContainer: string;
        };
    };
    static library: {};
    static build(options: any): Promise<any>;
    static buildLibrary(): {};
    static lookupBaseType(name: any, field: any): any;
    static loadLib(src: any): Promise<void>;
    static add(lib: any): void;
    static listNativeProps(ctl: any): string[];
    static loadCustomControl(f: any, src: any): Promise<any>;
    static importType(src: any): Promise<any>;
    static checkTypeConversion(type: any, rawValue: any): any;
    static getTypeParser(fieldMeta: any): (v: any) => any;
    static parseDate(value: any): string | number;
    static parseBoolean(value: any): boolean;
    static getFieldFromElement(e: any): any;
    static fieldToString(f: any): string;
}
import ExoFormNavigation from "./ExoFormNavigation";
import ExoFormValidation from "./ExoFormValidation";
