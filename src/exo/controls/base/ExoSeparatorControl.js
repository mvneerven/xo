import ExoElementControl from './ExoElementControl';

class ExoSeparatorControl extends ExoElementControl {
    constructor(context) {
        super(context);
        this.useContainer = false;
        this.htmlElement = document.createElement('hr');
    }
}
export default ExoSeparatorControl;