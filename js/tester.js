const Core = xo.core;
const DOM = xo.dom;

let data = null;

xo.on("new-form", e => {
    if (e.detail.id === "my-form") {
        e.detail.exoForm.on("schemaLoaded", ev => {
            data = ev.detail.host.dataBinding.model.instance.data
        })
    }
})

class HomeRoute extends xo.route {

    title = "Home";

    menuIcon = "ti-home";

    async render(path) {
        const me = this;
        await this.renderForm(path);
        
        this.addNonExoButtons()
    }

    addNonExoButtons() {
        let btn = document.createElement('button');
        btn.innerText = "Flinstone?";
        btn.addEventListener("click", e => {
            data.name.first = "Fred";
            data.name.last = "Flintstone";
        })
        this.area.add(btn);


        let btn2 = document.createElement('button');
        btn2.innerText = "Home?";
        btn2.addEventListener("click", e => {
            data.coords = [52.85582619118, 5.717743972222222];
            data.zoom = 17
        })
        this.area.add(btn2);


        let btn3 = document.createElement('button');
        btn3.innerText = "Pins?";
        btn3.addEventListener("click", e => {

            data.coords = [52.25582619118, 5.117743972222222];
            data.markers.push({
                position: [52.25582619118, 5.117743972222222],
                text: "yeah right"
            }),
                data.zoom = 7
        })
        this.area.add(btn3);
    }

    async renderForm(path) {

        const schema2 = {
            navigation: "auto",
            progress: "none",
            model: {
                instance: {
                    init: {
                        action: null
                    },
                    buildForm: {
                        jsonSchemaUrl: "",
                        jsonSchema: ""
                    }
                },
                logic: context => {
                    if (context.changed.property === "action") {
                        let page = parseInt(context.changed.newValue);
                        context.exo.addins.navigation.goto(page)
                    }

                    if (context.changed.property === "jsonSchemaUrl") {
                        const inst = context.model.instance.buildForm;
                        let url = context.changed.newValue;
                        fetch(url).then(x => x.text()).then(x => {
                            inst.jsonSchema = x;
                        })
                    }
                }
            },

            pages: [
                {
                    legend: "Build a form",
                    intro: "Building an ExoForm schema",
                    fields: [
                        {
                            id: "action",
                            bind: "instance.init.action",
                            name: "action",
                            type: "listview",
                            style: "max-height: 300px",
                            singleSelect: true,
                            views: "tiles",
                            caption: "Select how you want to get started",
                            properties: [
                                {
                                    key: "id"
                                },
                                {
                                    key: "name"
                                },
                                {
                                    key: "description",
                                    class: "details"
                                },
                                {
                                    key: "image",
                                    type: "img"

                                }
                            ],
                            mappings: {
                                tiles: [
                                    {
                                        key: "name",
                                        height: "2rem"
                                    }, {
                                        key: "description",
                                        height: "4rem"
                                    }, {
                                        key: "image",
                                        height: "80px"
                                    }
                                ]
                            },
                            items: [
                                {
                                    name: "<b>Start with a template</b>",
                                    description: "Load one of the existing templates and take it from there",
                                    image: "/img/template.png",
                                    id: "2"
                                },
                                {
                                    name: "<b>Start with a data schema/DTO</b>",
                                    description: "Generate a Form schema from your data definition (JSON)",
                                    image: "/img/json-schema.png",
                                    id: "3"

                                }
                            ]
                        }
                    ]
                }, {
                    legend: "Template",
                    intro: "Select a template to start with",
                    fields: [
                        {
                            id: "template",
                            name: "template",
                            type: "listview",
                            views: "tiles",
                            style: "max-height: 300px",
                            singleSelect: true,
                            caption: "ExoForm Template",
                            properties: [
                                {
                                    key: "value",
                                    isPrimaryKey: true
                                },
                                {
                                    key: "name"
                                },
                                {
                                    key: "description",
                                    class: "details"
                                }

                            ],
                            mappings: {
                                tiles: [
                                    {
                                        key: "name",
                                        height: "2rem"
                                    }, {
                                        key: "description",
                                        height: "4rem"
                                    }
                                ]
                            },
                            items: "/data/forms/templates.json"
                        }, {
                            name: "selectTemplate",
                            type: "button",
                            click: "selectTemplate",
                            caption: "Start with this template",
                            rules: [
                                {
                                    type: "enabled",
                                    expression: [
                                        "template", "change", "value", "!=", "undefined"
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    legend: "Data",
                    intro: "Load a JSON-Schema",
                    fields: [
                        {
                            type: "url",
                            caption: "Enter or select a URL of a JSON Schema",
                            bind: "instance.buildForm.jsonSchemaUrl",
                            fileTypes: ["application/json"],
                            dialog: true
                        },
                        {
                            type: "multiline",
                            caption: "JSON Schema data",
                            readonly: true,
                            class: "code",
                            rows: 20,
                            name: "schema-contents",
                            value: "@instance.buildForm.jsonSchema"

                        }
                    ]
                }
            ],
            controls: [
                {
                    name: "prev",
                    type: "button",
                    caption: "◁ Back",
                    class: "form-prev exf-btn"
                }
            ]
        }

        const schema = {
            model: {
                instance: {
                    data: {
                        id: "test1",
                        name: {
                            first: "Marc",
                            last: "van Neerven"
                        },
                        zoom: 8,
                        coords: [
                            55.33656310431969, -4.155451581529087
                        ],
                        markers: [
                            {
                                position: [52.85582619118, 5.717743972222222],
                                text: "Home!<br/> Is where the <i>heart</i> is!"
                            }
                        ]
                    }
                }
            },
            pages: [
                {
                    fields: [
                        {
                            type: "name",
                            name: "text",
                            caption: "Name",
                            bind: "instance.data.name"
                        },

                        {
                            type: "multiline",
                            caption: "Hello @instance.data.name.first",
                            name: "hello",
                            autogrow: true
                        },

                        {
                            type: "map",
                            name: "map",
                            caption: "Map",
                            bind: "instance.data.coords",
                            zoom: "@instance.data.zoom",
                            markers: "@instance.data.markers"
                        }

                    ]
                }
            ]
        }

        let form = await xo.form.run(schema, {
            id: "my-form",

            on: {

                page: this.change.bind(this),

                dataModelChange: this.change.bind(this),

                dom: {
                    change: e => {
                        console.log("CHANGED", e.target.name, e.target.value)
                    }
                }
            }
        });

        this.area.add(form)
    }

    get area() {
        return this.app.UI.areas.main;
    }

    change(e) {
        return

        let isPageEvent = e.type === "page";
        const context = e.detail;
        const x = isPageEvent ? context.host : context.host.exo;
        if (x && x.schema) {
            const m = x.schema.model,
                data = m.instance.data,
                a = x.addins;

            let sendMail = !data.emailSent && isPageEvent && e.detail.from === 1 && e.detail.page === 2;

            if (sendMail) {
                this.sendCode(data.email);
                data.confirmationSent = true;
            }

            if (data.email) {
                if (!data.code)
                    data.nextCaption = "Send Confirmation Email ▷"
                else
                    data.nextCaption = "Finalize upgrade ▷"

            }
            else {
                data.nextCaption = "Continue ▷"
            }
        }
    }

    sendCode(email) {
        let code = this.generateCode();
        let url = "http://localhost:4748/#//" + btoa(email + "/" + code);

        let data = {
            toAddress: email,
            message: "Confirm ",
            templateId: "d-e345f5fd07504f30b069e5af1c31e851",
            variables: {
                title: "Confirm your email for ASF",
                intro: "Build any Shopping Experience easily with the ASF Order Management System",
                subject: "Confirm your email for ASF",
                preheader: "You're one step away from creating your own shop!",
                cta_intro: "Code: " + code,
                cta: "Confirm Email Address",
                url: url
            }
        };

        pwa.restService.post("http://localhost:7071/sendmail/", {
            body: JSON.stringify(data)
        })
    }

    generateCode() {
        return 'xxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

class TestRoute extends xo.route {

    title = "Test";

    menuIcon = "ti-gift";

    hidden = true;

    accountSettings = {
        email: "marc@van-neerven.net",
        name: "Marc van Neerven"
    }

    get settings() {
        return pwa.settings.createGroup("Account",
            {
                type: "string",
                name: "name",
                title: "Your name",
                ui: {
                    placeholder: "Enter your name"
                }
            },
            {
                type: "string",
                name: "email",
                format: "email",
                title: "Email address"
            },
            {
                type: "string",
                name: "money",
                format: "currency",
                title: "Money",
                ui: {
                    prefix: {
                        char: "◷", font: "Segoe UI", size: "1.2rem"
                    }
                }
            }

        );

    }

    constructor() {
        super(...arguments);

        pwa.on("omnibox-init", e => {
            e.detail.options.categories["Test"] = {

                trigger: options => { return options.search.length >= 2 },
                getItems: async options => {
                    return [
                        {
                            text: "Test",
                            description: "Go to test!!!!!!"
                        }
                    ]
                },
                icon: "ti-package",
                action: options => {
                    document.location.hash = "/settings/" + options.search
                }
            }
        })

        pwa.settings.add(this.settings)
            .on("read", e => {
                e.detail.instance.data = this.accountSettings
            })
            .on("write", e => {
                this.accountSettings = e.detail.instance.data
            });
    }

    async render() {

        const schema = {
            pages: [
                {
                    fields: [
                        {
                            name: "autocomplete",
                            type: "text",
                            caption: "Autocomplete test",
                            placeholder: "Start typing...",
                            autocomplete: {
                                items: ["test", "okay", "bla"]
                            }
                        },

                        {
                            type: "listview",
                            name: "lv1",
                            view: "tiles",
                            columns: [
                                {
                                    name: "Name",
                                    mappedTo: "name",
                                    width: "8rem",
                                    type: "text",
                                    sort: true
                                },
                                {
                                    name: "Image",
                                    mappedTo: "imageUri",
                                    autoWidth: true,
                                    type: "img"
                                },
                                {
                                    name: "Description",
                                    mappedTo: "description",
                                    autoWidth: true,
                                    type: "text"
                                }
                            ],
                            items: [
                                {
                                    id: "test1",
                                    name: "Test",
                                    image: "https://stasfassetsdev.z6.web.core.windows.net/3cd3ef51-deab-47d3-944b-1d0e1e8ebe22/assets/boon-kriek.jpg",
                                    description: "A test item"
                                },
                                {
                                    id: "test2",
                                    name: "Lorem",
                                    image: "https://stasfassetsdev.z6.web.core.windows.net/3cd3ef51-deab-47d3-944b-1d0e1e8ebe22/assets/Lucifer",
                                    description: "... ipsum dolor sit amet"

                                },
                                {
                                    id: "test3",
                                    name: "Beauty",
                                    image: "https://stasfassetsdev.z6.web.core.windows.net/c737a2dd-1bad-4d23-836a-2c8c4bb977b2/assets/Sol-bier-mexican-500x500_1_1",
                                    description: "... is in the eye of the beholder"
                                }

                            ],
                            contextMenu: {
                                direction: "left",
                                items: [
                                    {
                                        tooltip: "Edit",
                                        icon: "ti-pencil",
                                        action: "edit",
                                    },
                                    {
                                        tooltip: "Delete",
                                        icon: "ti-close",
                                        action: "delete"
                                    }
                                ]

                            }

                        }
                    ]
                }
            ]
        };

        const schema1 = {
            pages: [
                {
                    fields: [
                        {
                            name: "autocomplete",
                            type: "text",
                            caption: "Autocomplete test",
                            placeholder: "Start typing...",
                            autocomplete: {
                                items: ["test", "okay", "bla"]
                            }
                        },

                        {
                            type: "listview",
                            name: "lv1",
                            view: "grid",
                            pageSize: 2,
                            views: ["grid", "tiles"],
                            mappings: {
                                tiles: [
                                    {
                                        key: "imageUri",
                                        height: "200px"
                                    },
                                    {
                                        key: "name",
                                        height: "2rem"
                                    },
                                    {
                                        key: "fileSizeAndType"
                                    },
                                ],
                                grid: [
                                    {
                                        key: "name",
                                        width: "8rem",
                                        sort: true,
                                        filterInPlace: true,
                                        searchURL: `${location.origin}/#/users/`,
                                    },
                                    {
                                        key: "imageUri",
                                        width: "120px"
                                    },
                                    {
                                        key: "description",
                                        autoWidth: true,
                                        sort: true
                                    },
                                    {
                                        key: "fileSizeAndType"
                                    },
                                ]
                            },
                            properties: [
                                {
                                    name: "Name",
                                    key: "name",
                                    type: "text"
                                },
                                {
                                    name: "Image",
                                    key: "imageUri",
                                    type: "img",
                                },
                                {
                                    name: "Description",
                                    key: "description",
                                    type: "text",
                                    class: "bold-text hide-sm"
                                },
                                {
                                    key: "fileSizeAndType",
                                    caption: "Details",
                                    dataCallback: (col, val, item) => { return `<span>${Core.formatByteSize(item.size) || ""} - ${item.type || ""}</span>` }
                                }
                            ],
                            items: [
                                {
                                    id: "test1",
                                    name: "Test",
                                    imageUri: "https://stasfassetsdev.z6.web.core.windows.net/3cd3ef51-deab-47d3-944b-1d0e1e8ebe22/assets/boon-kriek.jpg",
                                    description: "A test item",
                                    size: 3455677,
                                    type: "image/jpeg"
                                },
                                {
                                    id: "test2",
                                    name: "Lorem ipsum",
                                    imageUri: "https://stasfassetsdev.z6.web.core.windows.net/3cd3ef51-deab-47d3-944b-1d0e1e8ebe22/assets/Lucifer",
                                    description: "Gebrouwen uit 6 verschillende mouten, waardoor het bijzonder rijk van smaak is! Gebrouwen uit 6 verschillende mouten, waardoor het bijzonder rijk van smaak is! Gebrouwen uit 6 verschillende mouten, waardoor het bijzonder rijk van smaak is! Gebrouwen uit 6 verschillende mouten, waardoor het bijzonder rijk van smaak is!Gebrouwen uit 6 verschillende mouten, waardoor het bijzonder rijk van smaak is!Gebrouwen uit 6 verschillende mouten, waardoor het bijzonder rijk van smaak is!",
                                    size: 3455677,
                                    type: "image/gif"
                                },
                                {
                                    id: "test3",
                                    name: "Beauty",
                                    imageUri: "https://stasfassetsdev.z6.web.core.windows.net/c737a2dd-1bad-4d23-836a-2c8c4bb977b2/assets/Sol-bier-mexican-500x500_1_1",
                                    description: "... is in the eye of the beholder",
                                    size: 3455677,
                                    type: "image/png"
                                }

                            ],
                            contextMenu: {
                                direction: "left",
                                items: [
                                    {
                                        tooltip: "Edit",
                                        icon: "ti-pencil",
                                        action: "edit",
                                    },
                                    {
                                        tooltip: "Delete",
                                        icon: "ti-close",
                                        action: "delete"
                                    }
                                ]
                            }

                        }
                    ]
                }
            ]
        }


        this.elm = await xo.form.run(schema1, {
            on: {
                interactive: e => {
                    e.detail.host.get("lv1")._control.on("action", e => {
                        // debugger;
                    })
                }
            }
        });
        this.area.add(this.elm)
    }

    get area() {
        return this.app.UI.areas.main;
    }
}

class ProductsRoute extends xo.route {
    menuIcon = "ti-package";

    title = "Products";

    constructor() {
        super(...arguments);

        pwa.on("omnibox-init", e => {
            e.detail.options.categories["Products"] = {
                sortIndex: 1,
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
        });
    }

    async render(path) {
        let search = decodeURIComponent(path.substr(1));

        var prods = await fetch("/data/products.json").then(x => x.json());
        let div = document.createElement("div")
        div.classList.add("products-mock");

        prods.forEach(p => {

            let selected = (p.name == search) ? " selected" : "";

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
            useRoutes: r => {
                return true
            },
            placeholder: "The start of everything...",
            tooltip: "Navigate through this app by clicking & typing here..",

            categories: {
                Google: {
                    sortIndex: 500,
                    trigger: options => { return options.results.length === 0 && options.search.length >= 2 },
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

        // this.router.generateMenu(this.UI.areas.menu, m => {
        //     return m.name !== "SettingsRoute"
        // });
    }
}

new PWA({
    routes: {
        "/": HomeRoute,
        "/test": TestRoute,

        "/products": ProductsRoute

    }
})
