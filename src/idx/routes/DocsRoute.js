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
                    setTimeout(this.locateText(options.text), 1500)
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

    locateText(text) {
        let first = [...document.querySelectorAll('h1,h2,h3')]
            .map(e => { return { t: e.innerHTML, c: e } })
            .find(o => o.t.toLowerCase().includes(text.toLowerCase()));

        if (first)
            first.c.scrollIntoView(true)

    }

    async asyncInit() {
        await super.asyncInit();
    }

    async render(path) {
        let node = await DocsRoute.cms.get(path);
        let elm = this.mapLinks(DOM.parseHTML(node.html), path);
        elm.classList.add("user-select")
        this.area.add(elm);
        pwa.UI.areas.panel.add(document.getElementById("sources").outerHTML)
    }

    mapLinks(elm, path) {
        let basePath = this.getBasePath(path);

        elm.querySelectorAll("a[href]").forEach(a => {
            if (a.href.endsWith(".md")) {
                if (basePath === ".")
                    basePath = "";

                let link = basePath + new URL(a.href).pathname;
                a.setAttribute("href", "#/docs" + link)
            }
        });

        for (const i of elm.querySelectorAll("img[src]")) {
            let u = i.getAttribute("src");
            if (u.indexOf("//") === -1) {
                let link = "/md/refdocs/" + u;
                i.setAttribute("src", link)
            }
        };

        return elm;
    }

    getBasePath(path) {
        let d = path.split("/");
        d.length--;
        let s = d.join("/");
        return s;
    }

    get area() {
        return pwa.UI.areas.main;
    }
}

export default DocsRoute;