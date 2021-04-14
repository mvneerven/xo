export default ExoThemes;
declare class ExoThemes {
    static fluent: Fluent;
}
declare class Fluent extends ExoTheme {
}
declare class ExoTheme {
    constructor(name: any);
    fieldTemplate: string;
    name: any;
}
