const Core = xo.core;
const DOM = xo.dom;

let sharedData = null;

xo.form.bind(e=>{
    if(e.state ==="ready" && e.instances.data)
     sharedData = e.instances.data
}, true);

const area = document.querySelector("[data-pwa-area='main']");

const ent = new xo.form.entity({
    jsonSchema: "/data/schemas/product-schema.json",
    map: meta => {
        return {
            list: {
                control: {
                    properties: {
                        name: {
                            class: "name"
                        },
                        imageUri: {
                            type: "img"
                        },
                        description: {
                            class: "small hide-sm"
                        },
                        price: {
                            dataCallback: (p, v, i) => { return ent.formatValue(v.amount) }
                        }
                    },
                    mappings: {
                        grid: [
                            {
                                key: "name",
                                height: "2rem",
                                width: "14rem"
                            },
                            {
                                key: "description",
                                autoWidth: true,
                            },
                            {
                                key: "imageUri"
                            },
                            {
                                key: "price"
                            }
                        ],
                        tiles: [
                            {
                                key: "imageUri",
                                height: "100px",
                            },
                            {
                                key: "name",
                                height: "auto",
                            },
                            {
                                key: "price"
                            }
                        ]
                    }
                }
            },
            edit: {
                mappings: {
                    skip: ["recordVersion"],

                    pages: {
                        prd: { legend: "Product" },
                        prc: { legend: "Pricing" },
                    },

                    properties: {
                        name: {},

                        description: { type: "multiline", autogrow: true },

                        id: {
                            type: "hidden",
                        },

                        imageUri: {
                            page: "prd",
                            type: "image",
                            caption: "Linked Asset"
                        },

                        price: {
                            class: "compact",
                            page: "prc",
                            fields: {
                                amount: {
                                    type: "number",
                                    prefix: "€",
                                    step: 0.01,
                                    required: true,
                                },
                            },
                            columns: "6em 4em",
                            areas: `"amount currency"`,
                        },
                        vatPercentage: {
                            type: "dropdown",
                            page: "prc",
                            items: [
                                { name: "None", value: 0 },
                                { name: "9%", value: 9 },
                                { name: "21%", value: 21 },
                            ],
                        },

                        isForSale: {
                            page: "prc",
                            type: "switch",
                        },
                    },
                }
            }
        }
    },
    api: {
        get: query => {
            return fetch("/data/products.json").then(x => x.json())
        }
    }
})
    .on("edit", async e => {
        // e.preventDefault();
        // let frm = await e.detail.host.edit(e.detail.item);


        //e.returnValue = false;
    })

area.appendChild(await ent.list())
