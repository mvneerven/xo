import ExoFormProgressBase from './ExoFormProgressBase';
import ExoFormDefaultProgress from './ExoFormDefaultProgress';
import ExoFormPageProgress from './ExoFormPageProgress';
import ExoFormStepsProgress from './ExoFormStepsProgress';
import ExoFormSurveyProgress from './ExoFormSurveyProgress';

class ExoFormProgress {
    static types = {
        auto: undefined,
        none: ExoFormProgressBase,
        default: ExoFormDefaultProgress,
        page: ExoFormPageProgress,
        steps: ExoFormStepsProgress,
        survey: ExoFormSurveyProgress
    }

    static getType(exo) {
        let type = exo.schema.progress;
        if (typeof (type) === "undefined" || type === "auto")
            type = ExoFormProgress.matchProgressType(exo);

        return {
            name: type,
            type: ExoFormProgress.types[type]
        }
    }

    static matchProgressType(exo) {
        if (exo.schema.pages.length > 1) {
            if (exo.schema.navigation === "static")
                return "none"

            return "page"
        }
        return "default"
    }
}

export default ExoFormProgress;

