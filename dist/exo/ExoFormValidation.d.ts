export default ExoFormValidation;
declare class ExoFormValidation {
    static types: {
        auto: any;
        html5: typeof ExoFormDefaultValidation;
        inline: typeof ExoFormInlineValidation;
    };
    static getType(exo: any): any;
    static matchValidationType(exo: any): string;
}
declare class ExoFormDefaultValidation {
    constructor(exo: any);
    exo: any;
    checkValidity(): boolean;
    reportValidity(page: any): void;
    focus(field: any): boolean;
    isPageValid(index: any): boolean;
    runValidCheck: boolean;
    testValidity(e: any, field: any): void;
}
declare class ExoFormInlineValidation extends ExoFormDefaultValidation {
}
