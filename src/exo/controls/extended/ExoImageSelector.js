import xo from "../../../../js/xo";
import ExoMultiInputControl from "./ExoMultiInputControl";

class ExoImageSelector extends ExoMultiInputControl {
    constructor() {
        super(...arguments);

        const me = this;

        this.css = {
            "--exf-ac-itm-grid": "100px 1fr 7rem",
            "--exf-ac-itm-height": "80px",
            "--exf-ac-itm-width": "80px",
        }

        this.height = "200px";

        this.categories = {
            Image: {
                
                trigger: options => { return options.search.length >= 2 },
                getItems: options => {
                    return [{
                        text: "Search images on Pexels for '%search%'"
                    }]
                },
                action: options => {
                    me.input.value = options.text;
                    me.value = options.image;
                    me.image.style.backgroundImage = `url(${options.image})`
                },
                icon: "ti-image"
            },
        }

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
                    categories: this.categories,
                    items: e => {
                        return xo.core.acquireState(this.items).then(x => {
                            return x.map(i => {
                                return {
                                    ...i,
                                    category: "Image"
                                }
                            })
                        })
                    },
                    minlength: 2,
                    itemheight: "60px"
                }
            },
            image: {
                type: "div",
                caption: "",
                class: "exf-img-sm"
            },
            value: {
                type: "hidden"
            }
        }
    }

    set items(data) {
        this._items = data
    }

    get items() {
        return this._items
    }

    set value(data) {

        this._value = data;

        if (this.variable) {
            this.variable.value = data;
        }
    }

    get value() {
        return this._value;
    }

    async render() {
        await super.render();

        this.image = this.container.querySelector(".exf-img-sm");
        this.input = this.container.querySelector("input[type=search]");
        this.variable = this.container.querySelector("input[type=hidden]");

        const setImage = e => {
            if (e.target.value === "")
                this.image.style.backgroundImage = `none`
        };

        this.input.addEventListener("change", setImage);
        this.input.addEventListener("input", setImage);

        this.image.style = `background-repeat: no-repeat; background-size: contain; height: ${this.height || "100px"}; width: auto`

        //debug
        //this.input.data.field._control._autoComplete.clear = e => { }

        return this.container;
    }
}

export default ExoImageSelector;

