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
                }
            }
        });
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