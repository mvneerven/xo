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
                jsonSchemaRef: "",
                jsonSchemaText: "",
                jsonSchema: null,
                baseForm: null
            }
        },
        logic: context => {
            const inst = context.model.instance.buildForm;

            switch (context.changed.property) {

                case "action":
                    let page = parseInt(context.changed.newValue);
                    context.exo.addins.navigation.goto(page)
                    break
                case "template":
                    document.location.hash = "/studio/" + context.changed.newValue;

                    break;
                case "jsonSchemaUrl":
                    let url = context.changed.newValue;
                    inst.jsonSchemaRef = xo.core.dataURLtoBlob(url);

                    fetch(url).then(x => x.json()).then(x => {
                        inst.jsonSchema = x;
                        inst.jsonSchemaText = JSON.stringify(x, null, 2);
                    })
                    break;

                case "jsonSchema":
                    inst.baseForm = xo.form.entity.generateFromJSONSchema(inst.jsonSchema, inst.jsonSchemaUrl);
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
                            name: "<b>Start with a JSON schema</b>",
                            description: "Use a JSON schema to generate a form",
                            image: "/img/json-schema.png",
                            id: "3"

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
                    bind: "instance.init.template",
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
                    fileTypes: ["application/json"],
                    dialog: true,
                    dialogTitle: "Upload a JSON Schema"
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
        }
    ]
}