import ExoElementControl from './ExoElementControl';

class ExoFormControl extends ExoElementControl {
    constructor() {
        super(...arguments);
        this.htmlElement = document.createElement('form');
    }
}

export default ExoFormControl;