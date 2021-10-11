import xo from "../../../../js/xo";
import ExoMultiInputControl from "./ExoMultiInputControl";

class ExoImageSelector extends ExoMultiInputControl {
    constructor() {
        super(...arguments);

        this.acceptProperties(
            {
                name: "items",
                type: Object,
                default: [],
                description: "Items to load in autocomplete"
            },

            {
                name: "height",
                type: String,
                description: "Height of image preview"
            }
        );

        this.fields = {
            search: {
                type: "search",
                caption: "",
                class: "exf-std-lbl",   
                placeholder: "Image.png",
                autocomplete: {
                    items: e => {
                        return xo.core.acquireState(this.items)
                    },
                    minlength: 2
                }
            },
            image: {
                type: "div",
                caption: "",
                class: "exf-img-sm"
            }
        }

    }

    set items(data) {
        this._items = data
    }

    get items() {
        return this._items
    }

    set value(data){
        this._value = data;

        if(this.input){
            
            this.input.value = data;
            this.image.style.backgroundImage = `url(${data})`
        }
    }

    get value(){
        return this._value;
    }

    async render() {
        await super.render();

        this.image = this.container.querySelector(".exf-img-sm");

        this.input = this.container.querySelector("input[type=search]");
        const setImage = e => {
            this.image.style.backgroundImage = `url(${e.target.value})`
        };
        this.input.addEventListener("change", setImage);
        this.input.addEventListener("input", setImage);

        this.image.style = `background-repeat: no-repeat; background-size: contain; height: ${this.height || "100px"}; width: auto`
        
        return this.container;
    }
}

export default ExoImageSelector;

