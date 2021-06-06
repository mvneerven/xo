import Core from "./Core";

class PWA_OmniBox {

    constructor(options) {
        this.options = options || {};
        this.options.categories = this.options.categories || {};

        this.events = new Core.Events(this);

        if (this.options.useRoutes) {

            this.options.categories.App = {
                sortIndex: 10,
                trigger: options => { return true },
                getItems: options => {

                    return this.getRoutes(options).filter(i => {
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

            pwa.router.modules.forEach(r => {
                let add = r.module.omniBoxCategories;
                if (add) {

                    this.options.categories = {
                        ...this.options.categories,
                        ...add
                    }
                }

            });
        }
    }

    async render() {
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
                            placeholder: "Find shit...",
                            autocomplete: {
                                categories: this.options.categories,
                                items: this.items
                            }

                        }
                    ]
                }
            ]
        });
        return this.elm;
    }

    async items(options) {
        let arr = [];

        //todo create array sorted for categories
        // based on SortI
        for (var c in options.categories) {
            let catHandler = options.categories[c];
            if (catHandler.trigger(options)) {
                let catResults = await catHandler.getItems(options);

                arr = arr.concat(catResults.map(i => {
                    i.category = c;
                    return i;
                }))
            }
        }


        console.debug("PWA_OmniBox results: ", arr);
        return arr;
    }

    getRoutes(options) {

        let ar = []

        pwa.router.modules.forEach(r => {
            if (!r.hidden) {
                ar.push({
                    category: "App",
                    text: r.title || r.menuTitle,
                    icon: r.menuIcon,
                    route: r.path

                });

            }
        });

        return ar;
    }

}

export default PWA_OmniBox