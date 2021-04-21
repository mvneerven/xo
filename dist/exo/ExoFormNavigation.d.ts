export default ExoFormNavigation;
declare class ExoFormNavigation {
    static types: {
        auto: any;
        none: typeof ExoFormNoNavigation;
        default: typeof ExoFormDefaultNavigation;
        wizard: typeof ExoFormWizardNavigation;
        survey: typeof ExoFormSurveyNavigation;
    };
    static getType(exo: any): any;
    static matchNavigationType(exo: any): "default" | "wizard";
}
declare class ExoFormNoNavigation extends ExoFormNavigationBase {
    next(): void;
    back(): void;
    restart(): void;
}
declare class ExoFormDefaultNavigation extends ExoFormNoNavigation {
}
declare class ExoFormWizardNavigation extends ExoFormDefaultNavigation {
}
declare class ExoFormSurveyNavigation extends ExoFormWizardNavigation {
    checkForward(f: any, eventName: any, e: any): void;
}
declare class ExoFormNavigationBase {
    constructor(exo: any);
    buttons: {};
    exo: any;
    _visible: boolean;
    set visible(arg: boolean);
    get visible(): boolean;
    clear(): void;
    render(): void;
    container: ChildNode;
    canMove(fromPage: any, toPage: any): boolean;
    addButton(name: any, options: any): void;
    update(): void;
}
