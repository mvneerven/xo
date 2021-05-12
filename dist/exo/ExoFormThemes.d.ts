export default ExoFormThemes;
declare class ExoFormThemes {
    static types: {
        auto: any;
        none: typeof ExoFormTheme;
        fluent: typeof ExoFormFluentTheme;
        material: typeof ExoFormMaterialTheme;
    };
    static getType(exo: any): any;
    static matchTheme(exo: any): string;
}
declare class ExoFormTheme {
    constructor(exo: any);
    exo: any;
    apply(): void;
}
declare class ExoFormFluentTheme extends ExoFormTheme {
}
declare class ExoFormMaterialTheme extends ExoFormTheme {
}
