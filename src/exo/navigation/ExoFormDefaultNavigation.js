import ExoFormNavigationBase from './ExoFormNavigationBase';

class ExoFormDefaultNavigation extends ExoFormNavigationBase {
    controls = [
        {
            name: "send",
            type: "button",
            caption: "Submit",
            class: "form-post exf-btn"
        }
    ]
}

export default ExoFormDefaultNavigation;
