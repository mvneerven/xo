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
                jsonSchema: ""
            }
        },
        logic: context => {
            switch (context.changed.property) {

                case "action":
                    let page = parseInt(context.changed.newValue);
                    context.exo.addins.navigation.goto(page)
                    break
                case "template":
                    document.location.hash = "/studio/" + context.changed.newValue;

                    break;
                case "jsonSchemaUrl":
                    const inst = context.model.instance.buildForm;
                    let url = context.changed.newValue;
                    fetch(url).then(x => x.text()).then(x => {
                        inst.jsonSchema = x;
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
        }, {
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