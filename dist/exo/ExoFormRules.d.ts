export default ExoFormRules;
declare class ExoFormRules {
    static types: {
        auto: any;
        none: typeof ExoRuleEngineBase;
        default: typeof ExoRuleEngine;
    };
    static getType(exo: any): any;
    static matchRuleEngineType(exo: any): string;
}
declare class ExoRuleEngineBase {
    constructor(exo: any);
    exo: any;
    checkRules(): void;
}
declare class ExoRuleEngine extends ExoRuleEngineBase {
    ruleMethods: {
        visible: (typeof Field.show)[];
        enabled: (typeof Field.enable)[];
        scope: (typeof Page.scope)[];
        customMethod: (typeof Field.callCustomMethod)[];
        goto: (typeof Page.goto)[];
        dialog: (typeof Dialog.show)[];
    };
    interpretRule(objType: any, f: any, rule: any): void;
    setupEventEventListener(settings: any): void;
    getRenderedControl(id: any): any;
    testRule(f: any, control: any, value: any, compare: any, rawValue: any): any;
    getEventHost(ctl: any): any;
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
