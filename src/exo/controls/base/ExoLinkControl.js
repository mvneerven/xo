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

    async render() {
        if (this.external)
            this.htmlElement.setAttribute("target", "_blank");

        return super.render();
    }
}

export default ExoLinkControl;
