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
            }
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
            },

            {
                name: "textmap",
                type: Object,
                description: "Mapping to use to translate URL value to textbox"
            }

        );


    }

    get fields() {
        const me = this;

        return {
            search: {
                type: "search",
                caption: "",
                class: "exf-std-lbl",
                placeholder: this.placeholder,
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

    set fields(value) {
        // NA
    }

    async getImages(search) {
        search = search.toUpperCase();
        let acquire = async () => {
            return xo.core.acquireState(this.items).then(x => {
                return x.filter(i => {
                    let s = i.text || i;
                    return s.toUpperCase().indexOf(search) > -1;
                }).map(i => {
                    i = i.text ? i : { text: i };
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
                    this.input.value = this.mapText(this.url.pathname);

            }
            if (this.image) {

                this.setImage(data)
            }

        }
    }

    mapText(txt) {
        if (typeof (this.textmap) === "function") {
            return this.textmap(txt)
        }
        return txt;
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

        this.image = this.controls["image"].htmlElement;
        this.input = this.controls["search"].htmlElement;

        // after autocomplete has fired change event, set last option.text in text input
        this.input.addEventListener("result-selected", e => {
            this.input.value = this.selectedOption.text
        })

        this.variable = this.container.querySelector("input[type=hidden]");
        this.image.style = `background-repeat: no-repeat; background-size: contain; height: ${this.height || "100px"}; width: auto`
        this.input.addEventListener("change", this.setImage.bind(this));
        this.input.addEventListener("input", this.setImage.bind(this));

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

