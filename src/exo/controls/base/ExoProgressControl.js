import ExoElementControl from './ExoElementControl';

class ExoProgressControl extends ExoElementControl {

    static returnValueType = Number;

    constructor(context) {
        super(context);
        
        this.htmlElement = document.createElement('progress');

        this.acceptProperties(
            
            {
                name: "max",
                type: Number,
                default: 100
            }
        )
    }


    async render(){
        await super.render();
        
        this.container.classList.add("exf-std-lbl");
        this.htmlElement.setAttribute("max", this.max)
       
        this.htmlElement.setAttribute("value", this.value)
        return this.container
    }

}

export default ExoProgressControl;