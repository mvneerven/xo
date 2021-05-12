export default ExoFormDataBinding;
declare class ExoFormDataBinding {
    static origins: {
        schema: string;
        bind: string;
        none: string;
    };
    constructor(exo: any, instance: any);
    _model: {
        instance: {};
        bindings: {};
    };
    exo: any;
    _resolver: ExoFormDataBindingResolver;
    get resolver(): ExoFormDataBindingResolver;
    _ready(): void;
    _mapped: any;
    _triggerEvent(eventName: any, detail: any, ev: any): any;
    _signalDataBindingError(ex: any): void;
    get(path: any, defaultValue: any): any;
    on(eventName: any, func: any): ExoFormDataBinding;
    _init(exo: any, instance: any): void;
    _origin: string;
    toString(): string;
    get model(): {
        instance: {};
        bindings: {};
    };
    _instanceInitialized: boolean;
    _processFieldProperty(control: any, name: any, value: any): any;
}
import ExoFormDataBindingResolver from "./ExoFormDataBindingResolver";
