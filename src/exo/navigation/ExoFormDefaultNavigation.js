import ExoFormNavigationBase from './ExoFormNavigationBase';

class ExoFormDefaultNavigation extends ExoFormNavigationBase {
    controls = [
        {
            name: "send",
            type: "button",
            caption: "Submit",
            class: "form-post"
        }
    ]
}

export default ExoFormDefaultNavigation;
