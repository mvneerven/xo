import xo from "../../js/xo";
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
        if (this.options.useRoutes) {

            this.options.categories.App = {
                sortIndex: 10,
                trigger: options => { return true },
                getItems: options => {

                    return this.getRoutes(this.options.useRoutes).filter(i => {
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

            this.getRoutes(this.options.useRoutes).forEach(r => {
                
                let add = r.module.module.omniBoxCategories;
                if (add) {

                    this.options.categories = {
                        ...this.options.categories,
                        ...add
                    }
                }
            });
        }


        this.elm = await xo.form.run({
            navigation: "none",
            theme: "none",
            pages: [
                {
                    fields: [
                        {
                            name: "autocomplete",
                            type: "text",
                            caption: "",
                            placeholder: this.options.placeholder || "Start here...",
                            tooltip: this.options.tooltip || "Click & type to search...",
                            autocomplete: {
                                categories: this.options.categories,
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

    async items(options) {
        let arr = [];

        //todo create array sorted for categories
        // based on SortI
        for (var c in options.categories) {
            let catHandler = options.categories[c];
            if (catHandler.trigger(options)) {
                let catResults = [];
                try{
                    catResults = await catHandler.getItems(options);
                }
                catch(ex){ console.warn(`Error loading items for omniBox category '${c}'.`, ex)}

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
            if (!r.hidden) {
                ar.push({
                    category: "App",
                    text: r.title || r.menuTitle,
                    icon: r.menuIcon,
                    route: r.path,
                    module: r

                });

            }
        });

        if(typeof(filter) === "function"){
            ar = ar.filter(filter);
        }

        return ar;
    }

}

export default PWA_OmniBox