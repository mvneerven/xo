import ExoFormStaticNavigation from './ExoFormStaticNavigation';
import ExoFormNoNavigation from './ExoFormNoNavigation';
import ExoFormDefaultNavigation from './ExoFormDefaultNavigation';
import ExoFormWizardNavigation from './ExoFormWizardNavigation';
import ExoFormSurveyNavigation from './ExoFormSurveyNavigation';
import ExoFormTabStripNavigation from './ExoFormTabStripNavigation';

class ExoFormNavigation {
    static types = {
        auto: undefined,
        none: ExoFormNoNavigation,
        static: ExoFormStaticNavigation,
        default: ExoFormDefaultNavigation,
        wizard: ExoFormWizardNavigation,
        survey: ExoFormSurveyNavigation,
        tabstrip: ExoFormTabStripNavigation
    }

    static getType(exo) {
        let type = exo.schema.navigation;
        if (typeof (type) === "undefined" || type === "auto")
            type = ExoFormNavigation.matchNavigationType(exo);

        return {
            name: type,
            type: ExoFormNavigation.types[type]
        } 
    }

    static matchNavigationType(exo) {
        if (exo.schema.pages.length > 1)
            return "wizard"

        return "default"
    }
}

export default ExoFormNavigation;