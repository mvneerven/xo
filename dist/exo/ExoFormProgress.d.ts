export default ExoFormProgress;
declare class ExoFormProgress {
    static types: {
        auto: any;
        none: typeof ExoFormNoProgress;
        default: typeof ExoFormDefaultProgress;
        page: typeof ExoFormPageProgress;
        steps: typeof ExoFormStepsProgress;
        survey: typeof ExoFormSurveyProgress;
    };
    static getType(exo: any): any;
    static matchProgressType(exo: any): "none" | "page" | "default";
}
declare class ExoFormNoProgress {
    constructor(exo: any);
    exo: any;
    nav: any;
    render(): void;
}
declare class ExoFormDefaultProgress extends ExoFormNoProgress {
}
declare class ExoFormPageProgress extends ExoFormDefaultProgress {
}
declare class ExoFormStepsProgress extends ExoFormDefaultProgress {
    container: any;
    templates: {
        progressbar: string;
        progressstep: string;
    };
    ul: any;
    setClasses(): void;
}
declare class ExoFormSurveyProgress extends ExoFormDefaultProgress {
}
