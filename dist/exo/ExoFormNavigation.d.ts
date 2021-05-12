export default ExoFormNavigation;
declare class ExoFormNavigation {
    static types: {
        auto: any;
        none: typeof ExoFormNoNavigation;
        static: typeof ExoFormStaticNavigation;
        default: typeof ExoFormDefaultNavigation;
        wizard: typeof ExoFormWizardNavigation;
        survey: typeof ExoFormSurveyNavigation;
    };
    static getType(exo: any): any;
    static matchNavigationType(exo: any): "wizard" | "default";
}
declare class ExoFormNoNavigation extends ExoFormNavigationBase {
}
declare class ExoFormStaticNavigation extends ExoFormNavigationBase {
}
declare class ExoFormDefaultNavigation extends ExoFormNavigationBase {
}
declare class ExoFormWizardNavigation extends ExoFormDefaultNavigation {
}
declare class ExoFormSurveyNavigation extends ExoFormWizardNavigation {
    multiValueFieldTypes: string[];
    focusFirstControl(): void;
    checkForward(f: any, eventName: any, e: any): void;
}
declare class ExoFormNavigationBase {
    constructor(exo: any);
    buttons: {};
    exo: any;
    _visible: boolean;
    _currentPage: number;
    form: any;
    set visible(arg: boolean);
    get visible(): boolean;
    clear(): void;
    render(): void;
    container: ChildNode;
    _pageCount: number;
    _ready(e: any): void;
    canMove(fromPage: any, toPage: any): boolean;
    addButton(name: any, options: any): void;
    _updateView(add: any, page: any): any;
    /**
     * Moves to the next page in a multi-page form.
     */
    next(): void;
    /**
     * Moves to the previous page in a multi-page form.
     */
    back(): void;
    /**
     * Moves to the first page in a multi-page form.
     */
    restart(): void;
    /**
     * Moves to the given page in a multi-page form.
     */
    goto(page: any): any;
    get currentPage(): number;
    get pageCount(): number;
    _getNextPage(add: any, page: any): any;
    getLastPage(): number;
    updateButtonStates(): void;
    update(): void;
}
