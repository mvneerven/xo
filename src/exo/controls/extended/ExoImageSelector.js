//import xo from "../../../../js/xo";
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

        // set dropdown category 'Image' to handle selection
        this.categories = {
            Image: {
                action: options => {
                    me.isAction = true;
                    me.selectedOption = options;
                    try {
                        me.value = options.image;
                        me.input.value = options.text;

                    }
                    finally {
                        me.isAction = false;
                    }
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
                placeholder: "Image!.png",
                autocomplete: {
                    categories: this.categories,
                    items: e => {
                        return me.getImages(e.search.toUpperCase())
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

    async getImages(s) {
        let acquire = async () => {
            return xo.core.acquireState(this.items).then(x => {
                return x.filter(i => {
                    return i.text.toUpperCase().indexOf(s) > -1;
                }).map(i => {
                    return {
                        ...i,
                        category: "Image"
                    }
                })
            })
        }

        let cache = new xo.core.SimpleCache(acquire, 1000 * 60) // 1 minute cache

        return await cache.get();
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

        this.url = this.tryParseUrl(data);

        if (this.url) {
            if (!this.isAction) {

                if (this.input)
                    this.input.value = this.url.pathname;

            }
            if (this.image) {

                this.setImage(data)
            }

        }
    }

    tryParseUrl(data) {
        try {
            const url = new URL(data);
            return url
        }
        catch { }
    }

    get value() {
        return this._value;
    }

    async render() {
        await super.render();

        this.image = this.container.querySelector(".exf-img-sm");
        this.input = this.container.querySelector("input[type=search]");
        
        // after autocomplete has fired change event, 
        // set last option.text in text input
        this.input.addEventListener("result-selected", e=>{
            this.input.value = this.selectedOption.text
        })

        this.variable = this.container.querySelector("input[type=hidden]");

        this.image.style = `background-repeat: no-repeat; background-size: contain; height: ${this.height || "100px"}; width: auto`

        this.input.addEventListener("change", this.setImage.bind(this));
        this.input.addEventListener("input", this.setImage.bind(this));

        //debug - keep autocomplete dropdown open
        //this.input.data.field._control._autoComplete.clear = e => { }

        return this.container;
    }

    setImage(e) {
        if (e.target) {
            e = e.target.value;
        }
        if (this.image) {
            this.image.style.backgroundImage = `url(${e})`
        }
    };
}

export default ExoImageSelector;

