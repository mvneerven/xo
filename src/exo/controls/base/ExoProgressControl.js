import ExoElementControl from './ExoElementControl';

class ExoProgressControl extends ExoElementControl {

    constructor(context) {
        super(context);
        this.htmlElement = document.createElement('progress');
    }
}

export default ExoProgressControl;