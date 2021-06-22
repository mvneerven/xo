const Core = xo.core;
const DOM = xo.dom;

class HomeRoute extends xo.route {

    title = "Home";

    menuIcon = "ti-home";

    get settings() {
        return pwa.settings.createGroup("General", {
            type: "boolean",
            name: "darkmode",
            title: "Dark Mode",
            ui: {
                type: "switch"
            }
        });

    }

    constructor() {
        super(...arguments);

        pwa.settings.add(this.settings)
            .on("read", e => {
                // debugger
            })
            .on("write", e => {
                // debugger
            })

    }

    async render(path) {

        try {
            await this.renderForm(path);
        }
        catch (ex) {
            this.app.UI.areas.main.add("Could not render form: " + ex.toString)
        }
    }

    async renderForm(path) {
        let data = {
            email: "",
            needsEmail: true,
            code: "",
            emailSent: false,
            nextCaption: "Next ▷"
        }

        if (path) {
            let s = atob(path.substr(1)).split("/");
            data.email = s[0];
            data.code = s[1];
            data.emailSent = true
        }

        DOM.changeHash("");

        const schema = {
            validation: "inline",
            model: {
                instance: {
                    data: data
                }
            },
            pages: [
                {
                    legend: "Upgrade",
                    relevant: "@instance.data.needsEmail",
                    intro: "In order to upgrade your account, we need to send you an email for confirmation.",
                    fields: [
                        {
                            type: "email",
                            required: true,
                            bind: "instance.data.email",
                            name: "email",
                            caption: "Email address to use for confirmation",
                            placeholder: "john@doe.com"
                        }
                    ]
                },
                {
                    legend: "Check your inbox",
                    relevant: "@instance.data.needsEmail",
                    intro: `We have sent an email to <b>@instance.data.email</b>. <br/><br/>
                        If you have not received an email within 10 minutes, please try again or contact us.<br/><br/>
                        Don't forget to check your SPAM box!`,
                    fields: [
                        {
                            type: "div",
                            html: "Alternatively, you can take the 8 character code from the email and paste it here:"
                        },
                        {
                            type: "text",
                            name: "code",
                            bind: "instance.data.code",
                            caption: "Code (8 characters long)",
                            class: "exf-std-lbl exf-focus",
                            placeholder: "AaE5kL9g",
                            minlength: 8,
                            maxlength: 8
                        }
                    ]
                },
                {
                    legend: "Confirmed!",
                    intro: `You are now confirmed!`,
                    fields: [
                        {
                            type: "div",
                            html: "Your email address <b>@instance.data.email</b> has been confirmed."
                        },
                        {
                            type: "text",
                            name: "code1",
                            bind: "instance.data.code",
                            readonly: true,
                            caption: "Code",
                            class: "exf-std-lbl exf-focus",

                        }
                    ]
                },
                {
                    legend: "Pricing Tier",
                    intro: "",
                    fields: [
                        {
                            name: "shoptype",
                            type: "radiobuttonlist",
                            view: "tiles",
                            required: true,
                            caption: "Pricing Tiers",
                            items: [
                                {
                                    value: "starter",
                                    name: "Starter",
                                    description: "<i>unavailable</i>",
                                    disabled: true
                                },
                                {
                                    value: "standard",
                                    name: "Standard",
                                    checked: true,
                                    description: "free"
                                },
                                {
                                    value: "professional",
                                    name: "Professional",
                                    description: "contact us",
                                    disabled: true
                                }
                            ]
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
                },
                {
                    name: "next1",
                    type: "button",
                    caption: " @instance.data.nextCaption",
                    class: "form-next exf-btn",

                    action: "next"
                },
                {
                    name: "send",
                    type: "button",
                    caption: "Submit",
                    class: "form-post exf-btn"
                }
            ]
        }

        if (data.email) {
            schema.pages.shift();
            schema.pages.shift();
        }


        let form = await xo.form.run(schema, {
            on: {
                page: this.change.bind(this),
                post: (e) => { },
                dataModelChange: this.change.bind(this)
            }
        });

        this.app.UI.areas.main.add(form)
    }

    change(e) {
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
                            contextMenu: [
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
                            view: "tiles",
                            pageSize: 2,
                            views: ["tiles"],
                            controls: [
                                {
                                  type: "search",
                                  name: "filter",
                                  placeholder: "Type to filter...",
                                  listener: "input",
                                  class: "exf-listview-flt"
                                },
                            ],
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
                                // grid: [
                                //     {
                                //         key: "name",
                                //         width: "8rem",
                                //         sort: true,
                                //         filterInPlace: true,
                                //         searchURL: `${location.origin}/#/users/`,
                                //     },
                                //     {
                                //         key: "imageUri",
                                //         width: "120px"
                                //     },
                                //     {
                                //         key: "description",
                                //         autoWidth: true,
                                //         sort: true
                                //     },
                                //     {
                                //         key: "fileSizeAndType"
                                //     },
                                // ]
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
                                    dataCallback: (col, val, item) => {return `<span>${Core.formatByteSize(item.size) || ""} - ${item.type || ""}</span>`}
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
                                    description: "... ipsum dolor sit amet",
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
                            contextMenu: [
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

class SettingsRoute extends xo.route {

    title = "Settings";

    menuIcon = "ti-settings";


    constructor() {
        super(...arguments);

        pwa.on("omnibox-init", e => {
            e.detail.options.categories["Settings"] = {
                sortIndex: 5,
                trigger: options => { return options.search.length >= 2 },
                getItems: async options => {
                    return this.collectSettings().filter(i => {
                        let text = `${i.name} ${i.title}`.toLowerCase();
                        return text.indexOf(options.search) > -1;
                    }).map(r => {
                        return {
                            text: "Settings/" + r.title,
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
        })
    }

    async render(path) {
        let frm = await pwa.settings.render({
            on: {
                interactive: e => {
                    //debugger;
                }
            }
        });
        this.area.add(frm);
    }

    get area() {
        return this.app.UI.areas.main;
    }



    collectSettings() {
        let ar = [];

        pwa.router.modules.forEach(r => {
            if (!r.hidden) {
                if (r.module.settings) {
                    ar = ar.concat(r.module.settings.settings);
                }
            }
        });

        return ar;
    }
}

class CMS {
    tree = {};

    index = {};

    homeUrl = null;

    _ready = false;

    async load(path) {
        if (path.startsWith("."))
            path = path.substr(1);

        this.tree[path] = {
            title: "Home"
        };
        await this.readMd(this.tree[path], path);
        this._ready = true;
        return this.tree;
    }

    get ready() {
        return this._ready;
    }

    async readMd(node, path) {
        if (path.startsWith("."))
            path = path.substr(1);

        node.url = path;
        if (this.homeUrl === null)
            this.homeUrl = node.url;

        if (this.index[node.url]) {
            //debugger;
            return;
        }


        node.path = this.getBasePath(path);
        node.html = await Core.MarkDown.read(path);
        let elm = DOM.parseHTML(node.html);
        node.children = {};
        await this.addIndex(node, elm);
        await this.getChildren(node, elm);
    }

    async getChildren(node, elm) {
        let links = elm.querySelectorAll("a[href]");
        for (const a of links) {
            if (a.href.endsWith(".md")) {
                let link = node.path + new URL(a.href).pathname;
                a.setAttribute("href", "#/help" + link)
                node.children[link] = {
                    title: a.innerText
                }
                await this.readMd(node.children[link], link, this.index);
            }
        };
    }

    addIndex(node, elm) {
        let s = [node.title];
        elm.querySelectorAll("h1,h2,h3").forEach(h => {
            s.push(h.innerText);
        })

        this.index[node.url] = {
            text: s,
            node: node
        }
    }

    getBasePath(path) {
        let d = path.split("/");
        d.length--;
        let s = d.join("/");
        return s;
    }

    async get(url) {

        await Core.waitFor(() => {
            return this.ready
        }, 5000, 100);

        if (!url)
            url = this.homeUrl;

        let item = this.index[url]
        if (!item)
            throw TypeError("Not found: " + url);

        return item.node;

    }

    find(search) {
        search = search.toLowerCase();
        let ar = [];
        for (var url in this.index) {
            let item = this.index[url];
            item.text.filter(i => {
                return i.toLowerCase().indexOf(search) > -1;
            }).forEach(i => {
                let res = {
                    url: url,
                    node: item.node
                }
                if (!ar.find(i => {
                    return i.url === res.url
                }))
                    ar.push(res)
            })
        }
        return ar;
    }
}

class HelpRoute extends xo.route {

    title = "Help";

    menuIcon = "ti-help";

    // static constructor
    static _staticConstructor = (function () {
        HelpRoute.cms = new CMS();
        HelpRoute.cms.load("./README.md");
    })();

    constructor() {
        super(...arguments);

        pwa.on("omnibox-init", e => {
            e.detail.options.categories["Help"] = {
                sortIndex: 50,
                trigger: options => { return options.search.length >= 2 },
                getItems: async options => {
                    let results = HelpRoute.cms.find(options.search.toLowerCase());

                    return results.map(i => {
                        return {
                            path: i.url,
                            text: i.node.title
                        }
                    })

                },
                icon: "ti-help",
                action: options => {
                    document.location.hash = "/help" + options.path;
                }
            }
        });
    }

    async asyncInit() {
        await super.asyncInit();
    }

    async render(path) {

        let node = await HelpRoute.cms.get(path);

        let cms = HelpRoute.cms;


        let tv = await xo.form.run({
            type: "treeview",
            name: "tv1",
            items: {
                url: "/home",
                title: "Home",
                children: [
                    {
                        url: "/test",
                        title: "Test",
                        children: [
                            {
                                url: "/Bla",
                                title: "Bla"
                            }
                        ]
                    }
                ]
            },

        })

        this.area.add(tv)



        let elm = this.mapLinks(DOM.parseHTML(node.html), path);
        this.area.add(elm);


    }

    mapLinks(elm, path) {
        let basePath = this.getBasePath(path);

        elm.querySelectorAll("a[href]").forEach(a => {
            if (a.href.endsWith(".md")) {
                if (basePath === ".")
                    basePath = "";

                let link = basePath + new URL(a.href).pathname;
                a.setAttribute("href", "#/help" + link)
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
        "/settings": SettingsRoute,
        "/products": ProductsRoute,
        "/help": HelpRoute
    }
})
