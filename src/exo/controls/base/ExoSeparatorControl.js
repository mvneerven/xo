import DOM from '../../../pwa/DOM';
import ExoElementControl from './ExoElementControl';

class ExoSeparatorControl extends ExoElementControl {
    constructor(context) {
        super(context);
        this.useContainer = false;
        this.htmlElement = document.createElement('hr');
    }
    async render(){
        return await this.htmlElement;
    }
}
export default ExoSeparatorControl;