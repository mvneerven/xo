import ExoElementControl from './ExoElementControl';

class ExoDivControl extends ExoElementControl {

    html = "";

    constructor() {
        super(...arguments);
        this.htmlElement = document.createElement('div');

        this.acceptProperties(
            {
                name: "html",
                type: String,
                description: "Inner HTML of the div"
            }
        );
    }

    async render() {

        if (this.html) {
            this.htmlElement.innerHTML = this.html;
        }

        return await super.render()
    }

}

export default ExoDivControl;