const Core = xo.core;
const DOM = xo.dom;

class DocsRoute extends xo.route {

    title = "XO-JS Documentation";
    menuTitle = "Docs"

    menuIcon = "ti-help";

    // static constructor
    static _staticConstructor = (function () {
        DocsRoute.cms = new Core.MarkDown.CMS();
        DocsRoute.cms.load("./README.md");
    })();

    constructor() {
        super(...arguments);

        pwa.on("omnibox-init", e => {
            e.detail.options.categories["Help"] = {
                sortIndex: 50,
                trigger: options => { return options.search.length >= 2 },
                getItems: async options => {
                    let results = DocsRoute.cms.find(options.search.toLowerCase());

                    return results.map(i => {

                        return {
                            path: i.url,
                            text: i.title,
                            description: i.type !== 0 ? `Found in ${i.node.title} (${i.url})` : i.url
                        }
                    })

                },
                icon: "ti-help",
                action: options => {
                    document.location.hash = "/docs" + options.path;
                    setTimeout(() => {

                        DOM.locateText(options.text, {
                            root: document.querySelector(".md-converted-html")
                        });

                    }, 500)
                }
            }

            e.detail.options.categories["Controls"] = {
                sortIndex: 60,
                trigger: options => { return options.search.length >= 2 },
                icon: "ti-widget",
                getItems: async options => {
                    let ec = await xo.form.factory.build();
                    let srch = options.search.toLowerCase()
                    const meta = xo.form.factory.extractControlMeta(ec.library);
                    let results = meta.filter(i => {
                        let text = `${i.name} ${i.description}`.toLowerCase();
                        return text.indexOf(srch) > -1
                    });

                    return results.map(i => {
                        return {
                            text: i.name,
                            description: i.description,
                            example: i.example
                        }
                    })
                },
                action: options => {
                    navigator.clipboard.writeText(options.example);
                    pwa.UI.notifications.add("Copied to clipboard....")
                }
            }
        });
    }



    async render(path) {

        let btn = await xo.form.run({
            type: "button",
            icon: "ti-menu",
            name: "dropper",
            dropdown: [
                {
                    caption: `Copy`,
                    icon: "ti-files",
                    tooltip: "Copy to clipboard",
                    click: e => {
                        let pre = e.target.closest("PRE");
                        let code = pre.querySelector("CODE");
                        navigator.clipboard.writeText(code.innerText);
                        pwa.UI.notifications.add("Copied to clipboard....")
                    }

                },
                {
                    caption: `Load`,
                    icon: "ti-pencil",
                    tooltip: "Load code in Studio",
                    click: async e => {
                        let pre = e.target.closest("PRE");
                        let code = pre.querySelector("CODE");

                        try {
                            await this.tryLoadCode(code)
                        }
                        catch {
                            pwa.UI.notifications.add("Could not load this as an ExoForm schema", {
                                type: "error"
                            })
                        }
                    }
                },
            ]
        });

        btn.setAttribute("style", "position: absolute; right: 5px; top: 20px;");
        let elm;
        this.area.busy = true;
        try {
            let node = await DocsRoute.cms.get(path);
            elm = DOM.parseHTML(node.html);
            elm.classList.add("user-select")
            this.area.add(elm);
        }
        catch (ex) {
            console.error(path, ex)
        }
        finally {
            this.area.busy = false;
        }

        pwa.UI.areas.panel.add(document.getElementById("sources").outerHTML);

        elm.addEventListener("beforeDropdown", e => {
            let pre = e.target.closest("PRE");
            let code = pre.querySelector("CODE").innerText;

            let isRunnable = this.isRunnableSchema(code);
            e.detail.dropdownItems[1].style.display = isRunnable ? 'initial' : 'none';
        })

        elm.addEventListener("mousemove", e => {
            if (e.target.tagName === "PRE") {
                let codeElm = e.target.firstChild;
                if (codeElm) {
                    //if (codeElm.classList.contains("language-js") || codeElm.classList.contains("language-json")) {
                    let pre = e.target;
                    pre.style.position = "relative";
                    pre.appendChild(btn);
                    //}
                }
            }
        });

        elm.addEventListener("mousedown", e => {
            if (e.target.nodeName === "A" && e.target.href) {
                if (e.target.getAttribute("href").indexOf("//") > -1) {
                    e.target.setAttribute("target", "_blank")
                }
            }
        })

    }

    isRunnableSchema(code) {
        try {
            code = code.trim();

            if (!code)
                return false;

            if (code.startsWith("const schema "))
                return true;

            let r = JSON.parse(code);
            if ((Array.isArray(r.pages) && r.pages.length > 0) || (r.model && r.model.instance))
                return true;

        }
        catch {
            return false
        }
        return false;
    }

    async tryLoadCode(code) {

        return new Promise((resolve, reject) => {

            window.xo.form.run(code.innerText, {
                on: {
                    schemaLoaded: e => {
                        var json = e.detail.host.schema.toString("json")
                        var blob = new Blob([json], { type: "application/json" });
                        var url = URL.createObjectURL(blob);
                        document.location.hash = "/studio/" + url;
                    }
                }
            }).then(resolve).catch(reject)

        });
    }

    get area() {
        return pwa.UI.areas.main;
    }
}

export default DocsRoute;