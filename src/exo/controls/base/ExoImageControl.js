import ExoElementControl from './ExoElementControl';

class ExoImageControl extends ExoElementControl {
    constructor(){
        super(...arguments);

        this.htmlElement = document.createElement("img");

        this.acceptProperties(
            {
                name: "value",
                description: "The image URL (src)"
            }
        )
    }

    set value(src){
        this._value = src;
        
        this.htmlElement.setAttribute("src", this._value);
        
    }

    get value(){
        return this._value;
    }

    async render(){
        await super.render();
        this.container.classList.add("exf-std-lbl");
        return this.container;
    }
}

export default ExoImageControl;