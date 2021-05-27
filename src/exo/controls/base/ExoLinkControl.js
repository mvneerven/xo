import ExoElementControl from './ExoElementControl';

class ExoLinkControl extends ExoElementControl {

    constructor(context) {
        super(context);

        this.htmlElement = document.createElement("a");

        this.acceptProperties(
            {
                name: "external",
                type: Boolean,
                description: "External to open in new tab"
            },
            {
                name: "html",
                type: String
            }
        );
    }

    set value(href){
        this._value = href;
        this.htmlElement.setAttribute("href", this._value);
    }

    get value(){
        return this._value;
    }

    get external(){
        return this._external;
    }

    set external(value){
        this._external = value;
        if(value){
            this.htmlElement.setAttribute("target", "_blank");
        }
        else{
            this.htmlElement.removeAttribute("target");
        }
    }

    set html(value){
        this.htmlElement.innerHTML = value
    }

    get html(){
        return this.htmlElement.innerHTML;
    }

    async render(){
        await super.render();
        this.container.classList.add("exf-std-lbl");
        return this.container;
    }

}

export default ExoLinkControl;
