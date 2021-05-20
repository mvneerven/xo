import ExoElementControl from './ExoElementControl';

class ExoFormControl extends ExoElementControl {
    constructor(context) {
        super(context);
        this.htmlElement = document.createElement('form');
    }
}

export default ExoFormControl;