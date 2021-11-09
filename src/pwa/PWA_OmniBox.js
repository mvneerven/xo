import ExoFormFactory from "../exo/core/ExoFormFactory";
import Core from "./Core";

/**
 * OmniBox search facility for PWAs. Use this.omniBox = new PWA.OmniBox({..}) in PWA inherited class
 * 
 * Options: 
 * - categories: object containing list of categories with omnibox handling.
 * - useRoutes: boolean or filter function that indicates (which) routes should be added automatically
 */
class PWA_OmniBox {

    constructor(options) {
        this.options = options || {};
        this.options.categories = this.options.categories || {};
        this.events = new Core.Events(this);
    }

    async render() {

        let details = {
            options: this.options

        }
        pwa.events.trigger("omnibox-init", details);

        if (this.options.useRoutes) {
            const routes = this.getRoutes(this.options.useRoutes);

            this.options.categories.App = {
                sortIndex: 10,
                trigger: options => { return true },
                getItems: options => {

                    return routes.filter(i => {
                        if (i.module.hidden)
                            return false;

                        if (!options.search)
                            return true;
                        else {
                            return i.text.toLowerCase().startsWith(options.search.toLowerCase())
                        }
                    })

                },
                text: "Route",
                icon: "ti-arrow-right",
                action: options => {
                    document.location.hash = options.route
                }
            }
        }

        this.categories = this.getCategories(); // finalize and sort options.categories

        this.elm = await xo.form.run({
            navigation: "none",
            theme: "none",
            pages: [
                {
                    fields: [
                        {
                            name: "autocomplete",
                            type: "search",
                            caption: "",
                            prefix: {
                                icon: "ti-search"
                            },
                            placeholder: this.options.placeholder || "Start here...",
                            tooltip: this.options.tooltip || "Click & type to search...",
                            autocomplete: {
                                categories: this.categories,
                                items: this.items
                            }

                        }
                    ]
                }
            ]
        }, {
            on: {
                renderReady: e => {
                    this.autoCompleteControl = e.detail.host.get("autocomplete")._control;
                }
            }
        });
        this.elm.classList.add("pwa-omnibox");
        document.addEventListener("keydown", e => {

            if (e.key === "/") {
                if (!["INPUT", "TEXTAREA"].includes(e.target.tagName)) {
                    e.preventDefault();
                    this.autoCompleteControl.autocomplete.suggest();
                }
            }
        })
        return this.elm;
    }

    // finalize and sort options.categories
    getCategories() {
        let ar = [];
        
        for (var n in this.options.categories) {
            this.options.categories[n].id = n;
            this.options.categories[n].sortIndex = this.options.categories[n].sortIndex || 1000;
            ar.push(this.options.categories[n])
        }
        ar.sort((a, b) => {
            if (a.sortIndex < b.sortIndex) {
                return -1;
            }
            if (a.sortIndex > b.sortIndex) {
                return 1;
            }
            return 0;
        })

        let categories = {};
        ar.forEach(i => {
            categories[i.id] = i;
        });
        return categories;
    }

    async items(options) {
        let arr = [];
        options.results = [];

        for (var c in options.categories) {
            let catHandler = options.categories[c];
            options.results = arr;
            if (catHandler.trigger(options)) {
                let catResults = [];
                try {
                    catResults = await catHandler.getItems(options);
                }
                catch (ex) { console.warn(`Error loading items for omniBox category '${c}'.`, ex) }

                arr = arr.concat(catResults.map(i => {
                    i.category = c;
                    return i;
                }))
            }
        }
        console.debug("PWA_OmniBox results: ", arr);
        return arr;
    }

    getRoutes(filter) {

        let ar = []

        pwa.router.modules.forEach(r => {
            let c = r.module;

            let item = {
                category: "App",
                text: c.menuTitle || c.title,
                icon: c.menuIcon,
                route: c.path,
                module: c
            }
            if(c.menuTitle && c.title !== c.menuTitle){
                item.description = c.title
            }
            ar.push(item);


        });

        if (typeof (filter) === "function") {
            ar = ar.filter(filter);
        }

        return ar;
    }

}

export default PWA_OmniBox