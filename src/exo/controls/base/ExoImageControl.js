import ExoElementControl from './ExoElementControl';

class ExoImageControl extends ExoElementControl {
    constructor(){
        super(...arguments);

        this.htmlElement = document.createElement("img");

        this.acceptProperties(
            {
                name: "value",
                required: true,
                group: "Data",
                description: "The image URL (src)"
            },

            {
                name: "alt",
                required: true,
                group: "UI",
                description: "Specifies the ALT text for the image"
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

    set alt(value){
        this.htmlElement.setAttribute("alt", value);
    }

    get alt(){
        return this.htmlElement.getAttribute("alt");
    }


    async render(){
        await super.render();
        this.container.classList.add("exf-std-lbl");
        return this.container;
    }
}

export default ExoImageControl;