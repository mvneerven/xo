export default ExoFormValidation;
declare class ExoFormValidation {
    static types: {
        default: typeof ExoFormDefaultValidation;
        inline: typeof ExoFormInlineValidation;
    };
}
declare class ExoFormDefaultValidation {
    constructor(exo: any);
    exo: any;
    checkValidity(): boolean;
    reportValidity(): void;
    focus(field: any): boolean;
}
declare class ExoFormInlineValidation extends ExoFormDefaultValidation {
}
