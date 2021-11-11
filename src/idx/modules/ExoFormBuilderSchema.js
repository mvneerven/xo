const DOM = xo.dom;
const Core = xo.core;

class ExoFormBuilderSchema {
    constructor(builder) {
        this.builder = builder;
    }

    async render(container) {


        const schema = {
            id: "start-wiz",
            submit: false,
            navigation: "auto",
            progress: "none",
            model: {
                instance: {
                    init: {
                        action: null,
                        template: null
                    },
                    buildForm: {
                        jsonSchemaUrl: "",
                        jsonSchemaText: "",
                        jsonSchema: null,
                        openAPISchemaUrl: "",
                        openAPISchemaDTOs: null,
                        openAPISchemaDTOName: "",
                        formSchema: "",
                        baseForm: null
                    }
                },
                logic: context => {
                    const inst = context.model.instance.buildForm;
                    let url;
        
                    switch (context.changed.property) {
        
                        case "action":
                            let page = parseInt(context.changed.newValue);
                            if (page > 0) {
                                context.exo.addins.navigation.goto(page)
                            }
                            else {
                                switch (context.changed.newValue) {
                                    case "all":
                                        xo.form.factory.all().then(schema => {
                                            inst.baseForm = schema;
                                            context.exo.addins.navigation.goto(7)
                                        });
        
                                        break;
                                }
                            }
                            break
                        case "template":
                            pwa.router.route = "/studio/" + context.changed.newValue;
        
                            break;
                        case "jsonSchemaUrl":
                            url = context.changed.newValue;
                            console.log("JSON Schema URL", url)
                            fetch(url).then(x => x.json()).then(x => {
                                inst.jsonSchema = x;
                                inst.jsonSchemaText = JSON.stringify(x, null, 2);
                            })
                            break;
                        case "openAPISchemaUrl":
                            url = context.changed.newValue;
                            console.log("OpenAPI URL", url)
                            fetch(url).then(x => x.json()).then(x => {
                                inst.openAPISchema = x;
                                inst.openAPISchemaDTOs = Object.keys(x.components.schemas)
                            })
                            break
                        case "openAPISchemaDTOs":
                            break;
                        case "jsonSchema":
                            xo.form.schema.fromJsonSchema(inst.jsonSchemaUrl).then(x => {
                                inst.baseForm = x;
                            });
                            break;
                        case "openAPISchemaDTOName":
                            xo.form.schema.fromOpenApiSchema(inst.openAPISchema, {
                                dto: inst.openAPISchemaDTOName
                            }).then(x => {
                            
                                inst.baseForm = x;
                                //inst.openAPISchemaText = JSON.stringify(x, null, 2);
                            })
                            break;
                        case "openAPISchemaText":
                            xo.form.schema.fromOpenApiSchema(inst.openAPISchema, {
                                dto: inst.openAPISchemaDTOName
                            }).then(x => {
                                inst.baseForm = x;
                            })
                            break;
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
                            required: true,
                            views: "tiles",
                            caption: "Select how you want to get started",
                            tilewidth: "300px",
                            properties: [
                                {
                                    key: "id"
                                },
                                {
                                    key: "name"
                                },
                                {
                                    key: "description",
                                    class: "small"
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
                                    name: "<b>Search Examples</b>",
                                    description: "Check out an example",
                                    image: "/img/template.png",
                                    id: "2"
                                },
                                {
                                    name: "<b>See all ExoForm Controls</b>",
                                    description: "Generate a Schema that uses all available ExoForm controls",
                                    image: "/img/all-controls.png",
                                    id: "all"
        
                                },
                                {
                                    name: "<b>Start with a JSON schema</b>",
                                    description: "Use a JSON schema to generate a form",
                                    image: "/img/json-schema.png",
                                    id: "3"
        
                                },
                                {
                                    name: "<b>Start with an OpenAPI endpoint/schema</b>",
                                    description: "Use an OpenAPI schema to generate a form",
                                    image: "/img/openapi.png",
                                    id: "5"
                                }
                            ]
                        }
                    ]
                },
                {
                    legend: "Template",
                    intro: "Select one of the examples",
                    fields: [
                        {
                            id: "template",
                            name: "template",
                            bind: "instance.init.template",
                            type: "listview",
                            tilewidth: "200px",
                            views: "tiles",
                            style: "max-height: 300px",
                            singleSelect: true,
                            required: true,
                            caption: "",
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
                                    class: "small"
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
                            items: "/data/forms/examples.json"
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
                            required: true,
                            dialog: {
                                title: "Upload a JSON Schema",
                                fileTypes: ["application/json"],
                                maxSize: 50000
                            },
        
                        }
        
                    ]
                },
                {
                    legend: "Generate Form",
                    intro: "Translate JSON-Schema",
                    fields: [
                        {
                            type: "button",
                            name: "code1",
                            caption: "Generate Form Schema",
                            action: "load:instance.buildForm.baseForm"
                        }
                    ]
                },
                {
                    legend: "Connect to OpenAPI Schema",
                    fields: [
                        {
                            type: "url",
                            caption: "Enter or select a URL of an OpenAPI Schema",
                            bind: "instance.buildForm.openAPISchemaUrl",
                            required: true,
                            dialog: {
                                title: "Upload an OpenAPI Schema",
                                fileTypes: ["application/json"],
                                maxSize: 50000
                            }
                        }
        
                    ]
        
                },
                {
                    legend: "Generate Form",
                    intro: "Translate OpenAPI Schema",
                    fields: [
                        {
                            type: "radiobuttonlist",
                            items: "#/buildForm/openAPISchemaDTOs",
                            bind: "#/buildForm/openAPISchemaDTOName",
                            caption: "Select DTO"
                        },
                        {
                            type: "button",
                            name: "code2",
                            caption: "Generate Form Schema",
                            action: "load:instance.buildForm.baseForm"
                            // actions: [
                            //     {
                            //         if: {
                            //             nonempty: "#/buildForm/openAPISchemaDTOName"
                            //         },
                            //         do: {
                            //             alert: ["#/buildForm/openAPISchemaDTOName"]
                            //         }
                            //     }
                            // ]
                        }
                    ]
                },
        
        
        
                {
                    legend: "Generate Form",
                    intro: "Create schema with all available ExoForm controls",
                    fields: [
                        {
                            type: "button",
                            name: "code3",
                            caption: "Generate Form Schema",
                            action: "load:instance.buildForm.baseForm"
                        }
                    ]
                }
        
            ]
        }

        let form = await xo.form.run(schema, {
            on: {
                action: e => {
                    let exo = e.detail.host;
                    let model = exo.dataBinding.model;

                    switch (e.detail.action) {

                        case "load":

                            let obj = Core.getObjectValue(model, e.detail.parts[0])
                            let text = JSON.stringify(obj, null, 2);
                            this.builder.loadSchemaInEditor(text);
                            this.builder.renderer.model.load(text);
                            this.builder.tabStrip.tabs.schema.select();

                            break;

                    }
                }
            }
        });
        container.appendChild(form);

    }
}

export default ExoFormBuilderSchema;