import ExoFormDefaultNavigation from './ExoFormDefaultNavigation';

class ExoFormWizardNavigation extends ExoFormDefaultNavigation {
    controls = [
        {
            name: "prev",
            type: "button",
            caption: "◁ Back",
            class: "form-prev exf-btn"
        },
        {
            name: "next",
            type: "button",
            caption: "Next ▷",
            class: "form-next exf-btn"
        },
        {
            name: "send",
            type: "button",
            caption: "Submit",
            class: "form-post exf-btn"
        }
    ];
}

export default ExoFormWizardNavigation;