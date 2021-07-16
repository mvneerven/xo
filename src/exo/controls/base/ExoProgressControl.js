import ExoElementControl from './ExoElementControl';

class ExoProgressControl extends ExoElementControl {

    constructor(context) {
        super(context);
        this.htmlElement = document.createElement('progress');
    }


    async render(){
        await super.render();
        this.container.classList.add("exf-std-lbl");
        return this.container
    }
}

export default ExoProgressControl;