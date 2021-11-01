const schema = {
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
                    if(page > 0){
                        context.exo.addins.navigation.goto(page)
                    }
                    else{
                        switch(context.changed.newValue){
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
                    document.location.hash = "/studio/" + context.changed.newValue;

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
                        inst.openAPISchemaText = JSON.stringify(x, null, 2);
                    })
                    break

                case "jsonSchema":
                    xo.form.schema.fromJsonSchema(inst.jsonSchemaUrl).then(x => {
                        inst.baseForm = x;
                    });
                    break;
                case "openAPISchemaText":
                    xo.form.schema.fromOpenApiSchema(inst.openAPISchema).then(x => {
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
                            name: "<b>Start with a template</b>",
                            description: "Load one of the existing templates and take it from there",
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
            intro: "Select a template to start with",
            fields: [
                {
                    id: "template",
                    name: "template",
                    tilewidth: "300px",
                    bind: "instance.init.template",
                    type: "listview",
                    tilewidth: "200px",
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
                    items: "/data/forms/templates.json"
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

                    dialog: {
                        title: "Upload an OpenAPI Schema",
                        fileTypes: ["application/json"],
                        maxSize: 50000
                    },

                }

            ]

        },
        {
            legend: "Generate Form",
            intro: "Translate OpenAPI Schema",
            fields: [
                {
                    type: "button",
                    name: "code2",
                    caption: "Generate Form Schema",
                    action: "load:instance.buildForm.baseForm"
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