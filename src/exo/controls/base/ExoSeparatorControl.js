import DOM from '../../../pwa/DOM';
import ExoElementControl from './ExoElementControl';

class ExoSeparatorControl extends ExoElementControl {
    constructor() {
        super(...arguments);
        this.useContainer = false;
        this.htmlElement = document.createElement('hr');
    }
    async render(){
        return await this.htmlElement;
    }
}
export default ExoSeparatorControl;