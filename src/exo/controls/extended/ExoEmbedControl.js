
import ExoBaseControls from '../base/ExoBaseControls';

class ExoEmbedControl extends ExoBaseControls.controls.element.type {
    _width = "";
    _height = "";

    constructor(context) {
        super(context);

        this.htmlElement = document.createElement("iframe");

        this.acceptProperties(
            { name: "url", description: "Url of the page to embed" },
            { name: "width" },
            { name: "height" }
        )
    }

    async render() {
        this.htmlElement.setAttribute("src", this.url);
        this.htmlElement.setAttribute("frameborder", "0");
        this.htmlElement.setAttribute("allowfullscreen", "true");
        this.htmlElement.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");

        await super.render();

        let wrapper = document.createElement("div")
        wrapper.classList.add("exf-embed-container");

        if (this.width)
            wrapper.style.width = this.width;
        if (this.height)
            wrapper.style.height = this.height;

        wrapper.appendChild(this.htmlElement);
        this.container.querySelector(".exf-ctl").appendChild(wrapper);

        this.container.classList.add("exf-base-embed");

        return this.container
    }

    get width() {
        return this._width;
    }

    set width(value) {
        this._width = value;
        this.htmlElement.style.width = value;
    }

    get height() {
        return this._height;
    }

    set height(value) {
        this._height = value;
        this.htmlElement.style.height = value;
    }
}

export default ExoEmbedControl;
