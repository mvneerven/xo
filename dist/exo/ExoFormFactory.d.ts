/**
 * Hosts an ExoForm context to create forms with.
 * Created using {ExoFormFactory}.build()
 *
 * @hideconstructor
 */
export class ExoFormContext {
    constructor(config: any);
    config: any;
    baseUrl: string;
    library: any;
    _enrichMeta(library: any): any;
    _getProps(field: any, type: any, control: any): {
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
    createSchema(): ExoFormSchema;
    get(type: any): any;
    /**
    * Searches the control library using @param {Function} callback.
    * @return {Array} - list of matched controls.
    */
    query(callback: any): any[];
    isExoFormControl(formSchemaField: any): boolean;
    renderSingleControl(field: any): Promise<any>;
    createGenerator(): ExoSchemaGenerator;
}
export default ExoFormFactory;
import ExoForm from "./ExoForm";
import ExoFormSchema from "./ExoFormSchema";
import ExoSchemaGenerator from "./ExoSchemaGenerator";
/**
 * Factory class for ExoForm - Used to create an ExoForm context.
 * Provides factory methods. Starting point for using ExoForm.
 *
 * @hideconstructor
 */
declare class ExoFormFactory {
    static _ev_pfx: string;
    static events: {
        schemaLoaded: string;
        renderStart: string;
        getListItem: string;
        renderReady: string;
        interactive: string;
        reportValidity: string;
        dataModelChange: string;
        beforePage: string;
        page: string;
        pageRelevancyChange: string;
        post: string;
        error: string;
    };
    static meta: {
        navigation: {
            type: typeof ExoFormNavigation;
            description: string;
        };
        validation: {
            type: typeof ExoFormValidation;
            description: string;
        };
        progress: {
            type: typeof ExoFormProgress;
            description: string;
        };
        theme: {
            type: typeof ExoFormThemes;
            description: string;
        };
        rules: {
            type: typeof ExoFormRules;
            description: string;
        };
    };
    static Context: typeof ExoFormContext;
    static defaults: {
        imports: any[];
        defaults: {
            navigation: string;
            validation: string;
            progress: string;
            theme: string;
        };
    };
    static html: {
        classes: {
            formContainer: string;
            pageContainer: string;
            elementContainer: string;
            groupContainer: string;
            groupElementCaption: string;
        };
    };
    static library: {};
    /**
     * Build {ExoFormContext} instance.
     *
     */
    static build(options: any): Promise<any>;
    static buildLibrary(): {};
    static lookupBaseType(name: any, field: any): any;
    static loadLib(src: any): Promise<void>;
    static add(lib: any): void;
    static listNativeProps(ctl: any): string[];
    static loadCustomControl(f: any, src: any): Promise<any>;
    static importType(src: any): Promise<any>;
    static tryScriptLiteral(scriptLiteral: any): any;
    static checkTypeConversion(type: any, rawValue: any): any;
    static getTypeParser(fieldMeta: any): (v: any) => any;
    static parseDate(value: any): string | number;
    static parseBoolean(value: any): boolean;
    static getFieldFromElement(e: any, options: any): any;
    static fieldToString(f: any): string;
}
import ExoFormNavigation from "./ExoFormNavigation";
import ExoFormValidation from "./ExoFormValidation";
import ExoFormProgress from "./ExoFormProgress";
import ExoFormThemes from "./ExoFormThemes";
import ExoFormRules from "./ExoFormRules";
