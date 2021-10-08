const Core = xo.core;
const DOM = xo.dom;

class ISVCanvas {
    static async createForm() {
        const isvcanvas = await xo.core.acquireState("/data/isvcanvas.json"),
            schema = { pages: [] }

        Object.keys(isvcanvas.groups).forEach(g => {
            const page = { fields: [] }, group = isvcanvas.groups[g];
            Object.keys(group.questions).forEach(q => {
                const question = group.questions[q],
                    field = ISVCanvas.createField(q, question);
                page.fields.push(field);
            });
            page.legend = group.name;
            schema.pages.push(page);
        })

        return schema;
    }

    static createField(key, question) {
        const options = {
            type: "text",
            caption: question.text,
            name: key
        }

        switch (question.type) {
            case "single":
                options.type = "radiobuttonlist"
                break;
            case "multiple":
                options.type = "checkboxlist"
                break;
            default:
                options.type = question.type || "text"
        }

        if (question.answers) {
            const items = [];
            Object.keys(question.answers).forEach(a => {
                items.push({
                    value: a,
                    name: question.answers[a].text
                })
            })
            options.items = items;
            if (items.length > 6) {
                options.columns = Math.min(3, Math.round(items.length / 6))
            }
        }

        if (options.caption.substr(options.caption.length - 1, 1) === "*") {
            options.required = true;
            options.caption = options.caption.substr(0, options.caption.length - 1);
        }

        return options
    }
}

class HomeRoute extends xo.route {

    title = "Home";

    menuIcon = "ti-home";

    async render(path) {
        const me = this;
    }

    get area() {
        return this.app.UI.areas.main;
    }
}

class ContentTypeCreator {

    static get productTemplate() {
        return [
            {
                type: "text",
                name: "name",
                description: "Product name",
                extra: {
                    default: "test"
                }
            },
            {
                type: "longtext",
                name: "description",
                description: "Product description"

            },
            {
                type: "number",
                name: "price",
                description: "Product price"
            },
            {
                name: "defaultImage",
                type: "asset",
                description: "Main product image"
            }
        ]
    }

    static get types() {
        return {
            "text": {
                icon: "ti-text",
                properties: {
                    default: {
                        type: "string",
                        title: "Default"
                    },

                    pattern: {
                        type: "string",
                        title: "Regular Expression"
                    },
                    maxlength: {
                        type: "number",
                        title: "Maximum characters"
                    }
                }
            },
            "longtext": {
                icon: "ti-align-left",
                properties: {
                    default: {
                        type: "string",
                        title: "Default"
                    }

                }
            },
            "single-select": {
                icon: "ti-minus"

            },
            "multi-select": {
                icon: "ti-list"
            },
            "boolean": {
                icon: "ti-check",
                properties: {
                    default: {
                        type: "boolean",
                        title: "Default"
                    }
                }
            },
            "number": {
                icon: "ti-money",
                properties: {
                    default: {
                        type: "string",
                        title: "Default"
                    },
                    min: {
                        type: "number",
                        title: "Minimum"

                    },
                    max: {
                        type: "number",
                        title: "Maximum"
                    }
                }
            },
            "asset": {
                icon: "ti-image",
                properties: {
                    default: {
                        type: "string",
                        title: "Default"
                    },
                    types: {
                        type: "string",
                        title: "Types allowed"
                    },
                    folder: {
                        type: "string",
                        title: "Base path for assets"
                    }
                }

            },
            "date": {
                icon: "ti-calendar",
                properties: {
                    default: {
                        type: "date",
                        title: "Default"
                    },

                    min: {
                        type: "date",
                        title: "Minimum"
                    },
                    max: {
                        type: "date",
                        title: "Maximum"
                    }
                }

            }
        }
    }

    static async createForm(host) {

        const schema = {
            model: {
                instance: {
                    data: {
                        name: "Icecream",
                        id: "",
                        fields: ContentTypeCreator.productTemplate
                    }
                },

                logic: e => {
                    if (e.changed) {

                        switch (e.changed.property) {

                            case "type":
                                //debugger
                                console.log("Type change", e)
                                host.showTypeConfig(e.changed.newValue)
                                break;


                            case "field":
                                if (e.changed.newValue) {
                                    const list = e.exo.get("list")._control;
                                    list.value = [];
                                }

                                break;
                            case "newName":
                                if (e.model.instance.data.newName) {
                                    e.model.instance.data.fields.push({
                                        name: e.model.instance.data.newName,
                                        type: "text"
                                    });

                                    host.listView.refresh()
                                }
                                break

                        }

                        //console.log(JSON.stringify(e.model.instance.data, null, 2))
                    }
                }
            },
            pages: [
                {
                    legend: "Add Product Type",

                    fields: [
                        {
                            type: "text",
                            name: "name",
                            required: true,
                            minlength: 3,
                            maxlength: 20,
                            pattern: "([A-Za-z0-9\-\_]+)",
                            invalidmessage: "Name has to be between 3 and 20 charachters, and can contain text and numbers, dashes and underscores.",
                            caption: "Content Type",
                            placeholder: "e.g. Product",
                            bind: "instance.data.name"
                        }

                    ]
                },
                {
                    legend: "Define @instance.data.name",
                    intro: "Build the @instance.data.name product type, by adding custom properties and configure them.",
                    fields: [
                        {
                            type: "listview",
                            name: "list",
                            items: "@instance.data.fields",
                            bind: "instance.data.field",
                            noItemsFoundText: "No properties",
                            views: ["grid"],
                            mode: "static",
                            properties: [
                                {
                                    key: "name",
                                    name: "Name"
                                },
                                {
                                    key: "type",
                                    name: "",
                                    dataCallback: (a, b, c) => {
                                        let o = ContentTypeCreator.types[b];
                                        return `<span class="${o?.icon}"></span>`
                                    }
                                },
                                {
                                    key: "description",
                                    name: "Description"
                                }
                            ],
                            mappings: {
                                grid: [
                                    {
                                        key: "type",
                                        name: "Type",
                                        width: "3rem",
                                    },
                                    {
                                        key: "name",

                                        width: "10rem"
                                    },
                                    {
                                        key: "description",
                                        name: "Description",
                                        width: "1fr",
                                        class: "hide-sm"
                                    }

                                ]
                            },

                        },
                        {
                            name: "addName",
                            type: "textconfirm",
                            placeholder: "Property name",
                            caption: "Add new Product Property",
                            pattern: "([A-Za-z0-9\-\_]+)",

                            confirmButton: {
                                caption: "Add",
                                tooltip: "Click to add property"
                            },
                            bind: "instance.data.newName"
                        }

                    ]
                }

            ]
        };
        return schema;
    }
}

class BuildContenttypeRoute extends xo.route {

    title = "Product Types";

    menuIcon = "ti-pencil-alt2";

    async render(path) {
        const me = this;
        await this.renderForm(path);
    }

    get area() {
        return this.app.UI.areas.main;
    }

    async renderForm() {
        const schema = await ContentTypeCreator.createForm(this);

        this.area.add(await xo.form.run(schema, {
            on: {
                interactive: e => {
                    this.listView = e.detail.host.get("list")._control
                },
                dom: {
                    click: e => {
                        let x = e.target.closest(".exf-lv-item");

                        if (x) {
                            this.exo = xo.form.from(x);
                            let propertyName = x.getAttribute("data-id");
                            this.editProperty(propertyName)
                        }
                    }
                }
            }
        }))
    }



    async editProperty(propertyName) {

        const instance = this.exo.dataBinding.model.instance.data;
        let ix = -1
        let data = instance.fields.find(x => {
            ix++;
            if (x.name === propertyName) {
                return x
            }
        });

        let undoData = Core.clone(data);

        this.property = data;

        this.propTypeSpecificSchema = {}

        pwa.UI.showDialog({
            modal: false,
            mode: "side",
            title: "Field properties",
            body: await xo.form.run(this.propSchema(data), {
                on: {
                    interactive: e => {
                        this.subForm = e.detail.host.get("proptypeform")._control;
                        this.showTypeConfig(data.type)
                    }
                }
            }),
            confirmText: "Save",

            click: async (button, event) => {
                if (button === "confirm") {
                    this.listView.refresh();
                }
                else {
                    data = undoData;
                    instance.fields[ix] = undoData;
                }
            }
        });
    }

    showTypeConfig(type) {
        this.propType = type;
        console.log("Show Type Config: Property", this.property, "Type", type);
        const schema = this.createJSONSchema(ContentTypeCreator.types[type])
        console.log(JSON.stringify(schema, null, 2))
        this.propTypeSpecificSchema = {
            schema: schema
        }
        this.subForm.form = this.propTypeSpecificSchema;
    }

    createJSONSchema(o) {
        return {
            navigation: "static",
            model: {

                schemas: {
                    data: {
                        properties: { ...o?.properties || {} }
                    }
                }
            }
        }
    }


    propSchema(data) {
        console.log("Data: ", data);
        return {
            navigation: "none",
            model: {
                instance: {
                    data: data
                }
            },
            pages: [
                {
                    fields: [
                        {
                            name: "name",
                            type: "text",
                            bind: "instance.data.name",
                            caption: "Property name",
                            readonly: true
                        },
                        {
                            type: "multiline",
                            caption: "Description",
                            autogrow: true,
                            bind: "instance.data.description"
                        },
                        {
                            name: "type",
                            type: "listview",
                            tilewidth: "100px",
                            caption: "Property type",
                            bind: "instance.data.type",
                            singleSelect: true,
                            views: ["tiles"],
                            properties: [
                                {
                                    key: "type"
                                },
                                {
                                    key: "icon",
                                    dataCallback: (a, b, c) => {
                                        return `<span class="${b}"></span>`
                                    }
                                }

                            ],
                            mappings: {
                                tiles: [
                                    {
                                        key: "icon",
                                        size: "20px",
                                    },
                                    {
                                        key: "type",
                                        size: "1fr"
                                    }
                                ]
                            },
                            items: Object.entries(ContentTypeCreator.types).map(k => {
                                return {
                                    type: k[0],
                                    icon: k[1].icon
                                }
                            })
                        },

                        {
                            type: "sandbox",
                            name: "proptypeform",
                            form: {},
                            bind: "instance.data.extra"
                        }

                    ]
                }
            ]
        }
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
                                        class: "hide-xs",
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

class ISVCanvasRoute extends xo.route {
    menuIcon = "ti-menu-alt";

    title = "ISV Canvas";

    async render(path) {
        const me = this;
        await this.renderForm(path);
    }

    async renderForm(path) {
        const schema = await ISVCanvas.createForm();

        this.area.add(await xo.form.run(schema))
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
                    <span class="pull-right">&euro; ${Core.formatValue(p.price.amount, { type: "currency", currencyCode: "EUR" })}</span>
                </div>`))
        })

        this.area.add(div)
    }

    get area() {
        return this.app.UI.areas.main;
    }
}

class ImageSelectRoute extends xo.route {
    menuIcon = "ti-image";

    title = "Images";

    constructor() {
        super(...arguments);
    }

    async render(path) {
        await this.renderForm(path);
    }

    async renderForm(path) {
        const schema = {
            pages: [{
                fields: [

                    {
                        type: "multiinput",
                        columns: "4rem 1fr",
                        areas: "'image search'",
                        fields: {
                            image: {
                                type: "image",
                                name: "asset_img",

                            },
                            search: {
                                type: "search",
                                caption: "Select image",
                                placeholder: "/img/my-image.png",
                                autocomplete: {
                                    items: this.items,
                                    minlength: 2
                                }


                            }
                        }
                    },


                ]
            }]
        }

        this.area.add(await xo.form.run(schema))
    }

    get items() {
        return [
            {
                text: "(None)"
            },
            {
                category: "App",
                text: "/img/logo2.svg",
                image: "/img/logo2.svg"

            },
            {
                category: "App",
                text: "/img/commodity.png",
                image: "/img/commodity.png"

            }
        ]
    }

    get area() {
        return this.app.UI.areas.main;
    }
}

class MicroFrontendRoute extends xo.route {
    async render(path) {


        let frm = await xo.form.run({
            pages: [
                {
                    fields: [
                        {
                            type: "sandbox",
                            form: {
                                schema: "/data/forms/products.js"

                            }
                        }
                    ]
                }
            ]
        })

        this.area.add(frm)
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
        "/products": ProductsRoute,
        "/canvas": ISVCanvasRoute,
        "/contentypes": BuildContenttypeRoute,
        "/imageselect": ImageSelectRoute,
        "/microfrontend": MicroFrontendRoute,
    }
})
