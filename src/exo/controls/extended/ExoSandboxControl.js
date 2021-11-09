import ExoEmbedControl from './ExoEmbedControl';
import Core from '../../../pwa/Core';

class ExoSandboxControl extends ExoEmbedControl {
    constructor() {
        super(...arguments);

        window.addEventListener("message", e => {
            if (e.data.id === this.htmlElement.id) { // accept messages only from owned sandbox

                if (e.data.height) {
                    this.htmlElement.setAttribute("style", `width: 100%; height: ${(e.data.height + 32)}px; visibility: visible`);
                }
                else if (e.data.instance) {
                    this.value = e.data.instance;
                    var event = new Event('change', { bubbles: true });
                    this.htmlElement.dispatchEvent(event);
                }
            }
        })

        this.acceptProperties(
            {
                name: "form",
                type: Object
            },
            {
                name: "subform",
                type: Boolean,
                description: "Set to true to embed a form and bind it to a node in the master model"
            }
        )
    }

    get loaderDiv() {
        if (!this._loaderDiv)
            this._loaderDiv = document.createElement("div");

        return this._loaderDiv;

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
        this.container.classList.add("exf-std-lbl", "exf-sandbox");

        this.context.exo.on("interactive", async e => {
            this.loaderDiv.style.backgroundColor = this.bgColor;
            this.container.querySelector(".exf-ctl").appendChild(this.loaderDiv);
            this.htmlElement.addEventListener("load", this.setupIframe.bind(this))
            this.setSource()
        })

        return this.container;
    }

    set value(data) {
        this._value = data
    }

    get value() {
        return this._value;
    }

    async setSource() {
        this.loaderDiv.classList.add("exf-sb-ldr");

        this.htmlElement.setAttribute("src", await this.createDocumentUrl(this.form))
    }

    // create the document for the IFRAME
    async createDocumentUrl(form) {
        let url = new URL(window.location.href);

        if(!form)
            form = {};
        if (!form.schema)
            form.schema = {}

        

        if(this.subform){
            const schema = await xo.form.read(form.schema);
            if (schema.raw.model?.instance)
                throw TypeError("Subform must use binding to parent model")

            form.schema.model = form.schema.model || {};
            form.schema.model.instance = {
                data: Core.clone(this.value)
            }
        }

        const html = /*html*/`<!DOCTYPE html>
        <html>
        <head>
            <base href="${url.origin}" />
            <link href="${xo.isDebug ? '/css' : xo.path}/exf.css" rel="stylesheet" />
        </head>
        <body>
            <script type="module" src="${xo.isDebug ? '/dist' : xo.path}/xo.js"></script>
            <script type="module">
                
            window.xoMFId = "${this.htmlElement.id}";
                window.xoPayload = {
                schema: ${JSON.stringify(form.schema || {})}
            } ; 
            
            xo.form.sandbox.run();
            </script>
        </body>
        </html>`;

        return URL.createObjectURL(new Blob([html], { type: "text/html" }));
    }

    get bgColor() {
        if (!this._bgColor) {
            this._bgColor = this.getElementDefiningCssStyle(this.context.exo.form, "background-color")
                || "black"
        }
        return this._bgColor;
    }

    setupIframe() {
        const me = document.getElementById(this.htmlElement.id);
        me.contentWindow.postMessage({
            referrer: window.location.href,
            styles: this.getStyles()

        });
        this.loaderDiv.classList.add("hidden");
    }

    getStyles() {
        let compStyles = window.getComputedStyle(this.refElem);

        return `body {
            color: ${compStyles["color"]};
            font-family: ${compStyles["font-family"]};
            font-size: ${compStyles["font-size"]};
            background-color: ${this.bgColor};
        }`
    }

    getElementDefiningCssStyle(elm, style) {
        let styles = window.getComputedStyle(elm);
        let result = styles[style];
        if (style === "background-color") {
            if (result === "rgba(0, 0, 0, 0)" || result === "transparent")
                result = null;
        }
        if (!result) {
            elm = elm.parentNode;
            if (!elm || !(elm instanceof HTMLElement))
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
        console.log("Form set in sandbox", value);
        this.setSource();
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
        const payloadParam = urlParams.get('payload');

        const payload = payloadParam ? await fetch(payloadParam).then(x => x.json()) : window.xoPayload;
        window.sandboxId = urlParams.get("id") || window.xoMFId;

        const tellParent = data => {
            parent.postMessage({
                id: window.sandboxId,
                ...data
            })
        }


        if (payload) {

            if (!payload.schema)
                throw TypeError("Missing schema object under 'form' node");

            if (payload.styles) {
                payload.styles.forEach(link => {
                    xo.dom.addStyleSheet(link)
                })
            }

            document.body.appendChild(await xo.form.run(payload.schema, {
                on: {
                    schemaLoaded: e => {
                        e.detail.host.schema.data.navigation = "none"
                    },

                    dataModelChange: e => {
                        tellParent({
                            instance: JSON.parse(JSON.stringify(e.detail.model.instance.data))
                        })
                    },

                    // when our form is visible and interactive, 
                    // tell hosting page what our dimensions are.
                    // TODO: do same when resizing/DOM is changing
                    interactive: e => {
                        setTimeout(() => {
                            const w = document.documentElement.offsetWidth, h = document.documentElement.offsetHeight
                            console.debug(`ExoSandboxControl: Passing sandbox data to parent -> id: ${window.sandboxId}, width:${w}, height:${h}`);

                            parent.postMessage({
                                id: window.sandboxId,
                                width: w,
                                height: h
                            })
                        }, 1);
                    }
                }
            }));
        }
    }

}

export default ExoSandboxControl;