import ExoEmbedControl from './ExoEmbedControl';
import Core from '../../../pwa/Core';
import xo from '../../../../js/xo';

class ExoSandboxControl extends ExoEmbedControl {
    constructor() {
        super(...arguments);

        this.context.exo.on("interactive", async e => {
            //this.htmlElement.addEventListener("load", this.setupIframe.bind(this))
            let du = await Core.jsonToDataUrl(this.form);
            this.htmlElement.setAttribute("src", `/sandbox.html?payload=${Core.dataURLtoBlob(du)}`)

            Core.waitFor(() => {
                return this.htmlElement.contentWindow.xo
            }).then(() => {
                this.setupIframe()
            })
        })
        this.acceptProperties({
            name: "form",
            type: Object
        })
    }
    async render() {
        this.url = `about:blank`;

        this.htmlElement.setAttribute("allowtransparency", "true");
        this.htmlElement.style = "visibility:hidden"
        await super.render();
        this.refElem = document.createElement("span");
        this.container.appendChild(this.refElem);


        let wrapper = this.container.querySelector(".exf-embed-container");
        if (wrapper) {
            wrapper.classList.remove("exf-embed-container")
        }
        this.container.classList.add("exf-std-lbl");

        return this.container;
    }

    setupIframe() {
        console.log("Setting up IFRAME");

        window.addEventListener("message", e => {
            if (e.data.height) {

                this.htmlElement.style.width = "100%";
                this.htmlElement.style.height = (e.data.height + 32) + "px";
                this.htmlElement.style.visibility = 'visible';
            }
        })
        this.htmlElement.contentWindow.postMessage({
            referrer: window.location.href,
            styles: this.getStyles()
        })
    }

    getStyles() {
        let compStyles = window.getComputedStyle(this.refElem);

        return `body {
            color: ${compStyles["color"]};
            font-family: ${compStyles["font-family"]};
            font-size: ${compStyles["font-size"]};
            background-color: ${this.getElementDefiningCssStyle(this.refElem, "background-color")};
        }`
    }

    getElementDefiningCssStyle(elm, style) {
        let result = window.getComputedStyle(elm)[style];
        if (style === "background-color" && (result === "rgba(0, 0, 0, 0)" || result === "transparent")) result = null;
        if (!result) {
            elm = elm.parentNode;
            if (!elm)
                return null;

            return this.getElementDefiningCssStyle(elm, style)
        }
        return result;
    }

    get form() {
        return this._form;
    }

    set form(value) {
        this._form = value
    }

    /**
     * Initiates embedding runtime inside the sandbox control's iframe document.
     * Called using xo.form.sandbox.run() inside a script[type=module]
     */
    static async run() {
        window.addEventListener("message", e => {
            Object.keys(e.data).forEach(k => {
                switch (k) {
                    case "referrer": // makes sure relative links work in IFRAME
                        let base = document.createElement("base");
                        base.href = e.data[k].split("#")[0];
                        base.target = "_parent";
                        document.querySelector("head").appendChild(base)
                        break;
                    case "styles": // passes in the relevant styles to make IFRAME look 'seamless'
                        const styles = e.data[k];
                        const cssSheet = document.createElement("style");
                        cssSheet.innerHTML = styles;
                        document.querySelector("head").appendChild(cssSheet);
                        break;
                }
            })
        })

        const urlParams = new URLSearchParams(window.location.search);
        const payload = await fetch(urlParams.get('payload')).then(x => x.json());
        if (payload && payload.schema) {

            if (payload.styles) {
                payload.styles.forEach(link => {
                    xo.dom.addStyleSheet(link)
                })
            }

            document.body.appendChild(await xo.form.run(payload.schema, {
                on: {
                    // when our form is visible and interactive, 
                    // tell hosting page what our dimensions are.
                    // TODO: do same when resizing/DOM is changing
                    interactive: e => { 
                        setTimeout(() => {
                            parent.postMessage({
                                width: document.documentElement.offsetWidth,
                                height: document.documentElement.offsetHeight
                            })
                        }, 1);
                    }
                }
            }));
        }
    }

}

export default ExoSandboxControl;