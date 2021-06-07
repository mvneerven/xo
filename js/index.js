const Core = xo.core;
const DOM = xo.dom;

class HomeRoute extends xo.route {

    title = "Home";

    menuIcon = "ti-home";

    async render() {

        let form = await xo.form.run("/data/forms/products1.js", {
            on: {
                post: e => {
                    alert(JSON.stringify(e.detail.postData, null, 2))
                },
                dataModelChange: e => {
                    // console.log("datamodel change", JSON.stringify(e.detail.model, null, 2))
                },
                schemaLoaded: e => {
                    let schema = e.detail.host.schema;

                    schema.pages[0].fields = schema.pages[0].fields.map(f => {
                        switch (f.name) {
                            case "id":
                            case "recordVersion":
                                f.type = "hidden";
                                break;
                            case "price":
                                f.fields = {
                                    amount: {
                                        type: "number",
                                        prefix: "€"
                                    }
                                }
                                f.columns = "6em 4em";
                                f.areas = `"amount currency"`;
                                break

                            case "vatPercentage":
                                f.type = "dropdown";
                                f.items = [{ name: "None", value: 0 }, 9, 21]
                                break

                            case "imageUri":
                                f.type = "image";
                                break
                            case "tags":
                                f.type = "tags";
                                break
                        }

                        return f;
                    })
                },
                created: e => {
                    alert(e.detail.host)
                },
                error: e => {
                    let ex = e.detail.error;
                    const elm = DOM.parseHTML(`<div>Error: ${ex.toString()}</div>`);
                    document.querySelector("footer").appendChild(elm);
                    elm.scrollIntoView();
                },
                dom: {
                    click: e => {
                        debugger;
                    }
                }

            }
        });

        this.app.UI.areas.main.add(form)

    }

}

class TestRoute extends xo.route {

    title = "Test";

    menuIcon = "ti-gift";

    async render() {


        this.elm = await xo.form.run({

            pages: [
                {
                    fields: [
                        {
                            name: "autocomplete",
                            type: "text",
                            caption: "Autocomplete test",
                            placeholder: "Start typing...",
                            autocomplete: {
                                ///categories: this.options.categories,
                                items: ["test", "okay", "bla"]
                            }

                        }
                    ]
                }
            ]
        });
        this.area.add(this.elm)

    }

    get area() {
        return this.app.UI.areas.main;
    }



}

class SettingsRoute extends xo.route {

    title = "Settings";

    menuIcon = "ti-settings";

    schema = {
        pages: [
            {
                fields: [
                    {
                        type: "name",
                        name: "name",
                        caption: "Your name",
                        tooltip: "Your full name"
                    },
                    {
                        type: "email",
                        name: "email",
                        caption: "Email address",
                        tooltip: "Email address linked to your account"
                    },
                    {
                        type: "tel",
                        name: "phone",
                        caption: "Phone number",
                        tooltip: "Your phone number"
                    }
                ]
            }
        ]
    }

    async render(path) {
        this.area.add(await xo.form.run(this.schema, {
            on: {
                interactive: e => {
                    let fieldName = path.replace("/", "");
                    var field = e.detail.host.get(fieldName);
                    if (field) {
                        field._control.focus();
                    }
                }
            }
        }));
    }

    get area() {
        return this.app.UI.areas.main;
    }

    get omniBoxCategories() {
        return {
            Settings: {

                trigger: options => { return options.search.length >= 2 },
                getItems: async options => {

                    return this.schema.pages[0].fields.filter(i => {
                        let text = `${i.caption} ${i.tooltip}`.toLowerCase();
                        return text.indexOf(options.search) > -1;
                    }).map(r => {
                        return {
                            text: "Settings/" + r.caption,
                            description: "Go to settings",
                            field: r.name
                        }
                    })
                },
                text: "Search for '%search%' products",
                icon: "ti-package",
                action: options => {
                    document.location.hash = "/settings/" + options.field
                }

            }
        }
    };
}

class HelpRoute extends xo.route {

    title = "Help";

    menuIcon = "ti-help";

    async asyncInit() {
        await super.asyncInit();

        await this.getMD();
    }

    async render(path) {

        let readmeElement = DOM.parseHTML(await Core.MarkDown.read(this.readMeMD));
        this.area.add(readmeElement);

        if (path) {
            let sentencePart = decodeURIComponent(path.substr(1));
            if (sentencePart.endsWith("..."))
                sentencePart = sentencePart.substr(0, sentencePart.length - 3);

            let headings = readmeElement.querySelectorAll("h1, h2, h3");
            for (var i = 0; i < headings.length; i++) {
                let h = headings[i];
                if (h.innerText.startsWith(sentencePart)) {
                    h.scrollIntoView();
                    break;
                }
            }
        }
    }

    async getMD() {
        if (!this.readMeMD)
            this.readMeMD = await fetch("./README.md").then(x => x.text());
    }

    get area() {
        return this.app.UI.areas.main;
    }

    get omniBoxCategories() {
        return {
            Help: {

                trigger: options => { return options.search.length >= 2 },
                getItems: async options => {
                    await this.getMD();
                    return this.readMeMD.split('\n').filter(l => {
                        return l.startsWith('#') && l.toLowerCase().indexOf(options.search.toLowerCase()) > -1;
                    }).map(l => {

                        let text = l.replace(/\#/g, "").substr(0, 25).trim() + '...';

                        return {
                            text: text
                        }
                    })
                },
                text: "Search for '%search%' in help",
                icon: "ti-help",
                action: options => {
                    document.location.hash = "/help/" + options.text;
                }

            }
        }
    };
}

class ProductsRoute extends xo.route {
    menuIcon = "ti-package";

    title = "Products";

    get omniBoxCategories() {
        return {
            Products: {
                sortIndex: 100,
                trigger: options => { return options.search.length >= 2 },
                getItems: async options => {

                    var prods = await fetch("/data/products.json").then(x => x.json());

                    return prods.filter(p => {
                        return p.name.toLowerCase().indexOf(options.search.toLowerCase()) >= 0;
                    }).map(r => {
                        return {
                            text: r.name,
                            description: r.description
                        }
                    })
                },
                text: "Search for '%search%' products",
                icon: "ti-package",
                action: options => {
                    document.location.hash = '/products/' + options.text
                }

            }
        }
    };

    async render(path) {
        
        let search = decodeURIComponent(path.substr(1));

        var prods = await fetch("/data/products.json").then(x => x.json());
        let div = document.createElement("div")
        div.classList.add("products-mock");

        prods.forEach(p => {

            let selected = (p.name==search) ? " selected": "";

            div.appendChild(DOM.parseHTML(
                /*html*/`<div class="product ${selected}">
                    <span>
                        <div>${p.name}</div>
                        <div><small>${p.description}</small></div>
                    </span> 
                    <span class="pull-right">&euro; ${p.price.amount}</span>
                </div>`))
        })

        this.area.add(div)
    }

    get area() {
        return this.app.UI.areas.main;
    }
}

class PWA extends xo.pwa {
    routerReady() {


        this.omniBox = new PWA.OmniBox({
            useRoutes: true,
            placeholder: "The start of everything...",
            tooltip: "Navigate through this app by clicking & typing here..",

            categories: {
                Google: {
                    sortIndex: 500,
                    trigger: options => { return options.search.length >= 2 },
                    text: "Search on Google for '%search%'",
                    getItems: options => {
                        return [{
                            text: "Search on Google for '%search%'"
                        }]
                    },
                    icon: "ti-search",
                    action: options => {
                        options.url = `https://www.google.com/search?q=${options.search}`;
                    },
                    newTab: true
                },

                Images: {
                    sortIndex: 600,
                    trigger: options => { return options.search.length >= 2 },
                    getItems: options => {
                        return [{
                            text: "Search images on Pexels for '%search%'"
                        }]
                    },
                    action: options => {
                        options.url = `https://www.pexels.com/search/${options.search}`;
                    },
                    newTab: true,
                    text: "Search for '%search%' images",
                    icon: "ti-image"
                },

                Products: {
                    sortIndex: 100,
                    trigger: options => { return options.search.length >= 2 },
                    getItems: options => {
                        return [{
                            text: "Search products with term/tag '%search%'"
                        }]
                    },
                    text: "Search for '%search%' products",
                    icon: "ti-package",
                    action: options => {
                        document.location.hash = `/products/${options.search}`;
                    }
                }
            }
        });

        this.omniBox.render().then(elm => {
            this.UI.areas.header.add(elm)
        })
    }
}

new PWA({
    routes: {
        "/": HomeRoute,
        "/test": TestRoute,
        "/settings": SettingsRoute,
        "/products": ProductsRoute,
        "/help": HelpRoute
    }
})
