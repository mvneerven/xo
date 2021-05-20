import ExoFormDefaultNavigation from './ExoFormDefaultNavigation';

class ExoFormWizardNavigation extends ExoFormDefaultNavigation {
    controls = [
        {
            name: "prev",
            type: "button",
            caption: "◁ Back",
            class: "form-prev"
        },
        {
            name: "next",
            type: "button",
            caption: "Next ▷",
            class: "form-next"
        },
        {
            name: "send",
            type: "button",
            caption: "Submit",
            class: "form-post"
        }
    ];
}

export default ExoFormWizardNavigation;