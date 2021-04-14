export default ExoForm;
/*!
 * ExoForm - Generic Form/Wizard Generator - using JSON Form Schemas
 * (c) 2021 Marc van Neerven, MIT License, https://cto-as-a-service.nl
*/
declare class ExoForm {
    static meta: {
        properties: {
            all: string[];
            map: {
                class: string;
                readonly: string;
                dirname: string;
                minlength: string;
                maxlength: string;
            };
            reserved: string[];
        };
        templates: {
            empty: string;
            exocontainer: string;
            default: string;
            nolabel: string;
            text: string;
            labelcontained: string;
            form: string;
            static: string;
            fieldset: string;
            legend: string;
            pageIntro: string;
            datalist: string;
            datalistItem: string;
            button: string;
        };
    };
    static _staticConstructor: void;
    static setup(): void;
    static version: string;
    constructor(context: any, opts: any);
    defaults: {
        type: string;
        baseUrl: string;
        navigation: string;
        runtime: {
            progress: boolean;
        };
        form: {
            theme: string;
            class: string;
        };
        multiValueFieldTypes: string[];
        ruleMethods: {
            visible: (typeof Field.show)[];
            enabled: (typeof Field.enable)[];
            scope: (typeof Page.scope)[];
            customMethod: (typeof Field.callCustomMethod)[];
            goto: (typeof Page.goto)[];
            dialog: (typeof Dialog.show)[];
        };
    };
    context: import("./ExoFormFactory").ExoFormContext;
    options: any;
    formSchema: {
        type: string;
        baseUrl: string;
        navigation: string;
        runtime: {
            progress: boolean;
        };
        form: {
            theme: string;
            class: string;
        };
        multiValueFieldTypes: string[];
        ruleMethods: {
            visible: (typeof Field.show)[];
            enabled: (typeof Field.enable)[];
            scope: (typeof Page.scope)[];
            customMethod: (typeof Field.callCustomMethod)[];
            goto: (typeof Page.goto)[];
            dialog: (typeof Dialog.show)[];
        };
    };
    form: ChildNode;
    container: ChildNode;
    load(schema: any): Promise<any>;
    applyLoadedSchema(): void;
    triggerEvent(eventName: any, detail: any, ev: any): any;
    getTotalFieldCount(schema: any): number;
    isPageValid(index: any): boolean;
    getField(name: any): any;
    findField(compare: any): any;
    renderForm(): Promise<any>;
    finalizeForm(): void;
    cleanup(): void;
    on(eventName: any, func: any): ExoForm;
    renderPages(): Promise<any>;
    _addRendered(f: any, rendered: any, pageFieldsRendered: any, p: any, page: any): any;
    getFormContainerProps(): any;
    enrichPageSettings(p: any, pageNr: any): any;
    query(matcher: any): any[];
    map(mapper: any): ExoForm;
    showFirstInvalid(): boolean;
    submitForm(ev: any): void;
    getFormValues(e: any): Promise<any>;
    getFieldValue(f: any): any;
    gotoPage(page: any): any;
    nextPage(): void;
    previousPage(): void;
    updateView(add: any, page: any): any;
    currentPage: any;
    getNextPage(add: any, page: any): any;
    getLastPage(): number;
    focusFirstControl(): void;
    renderSingleControl(f: any): Promise<any>;
    createControl(f: any): Promise<any>;
    testValidity(e: any, field: any): void;
    checkRules(): void;
    getRenderedControl(id: any): any;
    getFieldFromElementId(id: any): any;
    interpretRule(objType: any, f: any, rule: any): void;
    setupEventEventListener(settings: any): void;
    getEventHost(ctl: any): any;
    testRule(f: any, control: any, value: any, compare: any, rawValue: any): any;
    clear(): void;
}
declare class Field {
    static show(obj: any): void;
    static hide(obj: any): void;
    static enable(obj: any): void;
    static disable(obj: any): void;
    static callCustomMethod(obj: any): void;
}
declare class Page {
    static scope(obj: any): void;
    static descope(obj: any): void;
    static goto(obj: any): any;
}
declare class Dialog {
    static show(obj: any): void;
}
