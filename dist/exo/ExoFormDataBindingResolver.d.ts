export default ExoFormDataBindingResolver;
declare class ExoFormDataBindingResolver {
    constructor(dataBinding: any);
    dataBinding: any;
    exo: any;
    _boundControlState: any[];
    addBoundControl(settings: any): void;
    resolve(): void;
    _resolveVars(str: any, cb: any, ar: any): any;
    _replaceVars(node: any): void;
    _checkSchemaLogic(): void;
    assembleScript(logic: any): string;
    applyJSLogic(f: any, js: any, model: any): void;
    _bindControlStateToUpdatedModel(): void;
}
