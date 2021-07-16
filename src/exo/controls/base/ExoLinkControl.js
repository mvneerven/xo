import ExoElementControl from './ExoElementControl';

class ExoLinkControl extends ExoElementControl {

    constructor(context) {
        super(context);

        this.useContainer = false,

            this.htmlElement = document.createElement("a");
        this.htmlElement.innerHTML = this.caption

        this.acceptProperties(
            {
                name: "external",
                type: Boolean,
                description: "External to open in new tab"
            },
            {
                name: "html",
                type: String
                
            },

            {
                name: "url",                
                type: String
            }


        );
    }

    set value(href) {
        this._value = href;
        this.htmlElement.setAttribute("href", this._value);
    }

    get value() {
        return this._value;
    }

    set url(value) {
        this.value = value;
    }

    get url() {
        return this.value
    }

    get external() {
        return this._external;
    }

    set external(value) {
        this._external = value;
        if (value) {
            this.htmlElement.setAttribute("target", "_blank");
        }
        else {
            this.htmlElement.removeAttribute("target");
        }
    }

    set html(value) {
        this.htmlElement.innerHTML = value
    }

    get html() {
        return this.htmlElement.innerHTML;
    }

    async render() {
        await super.render();
        if(this.external)
            this.htmlElement.setAttribute("target", "_blank");
        return this.htmlElement
    }
}

export default ExoLinkControl;
