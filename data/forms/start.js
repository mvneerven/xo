const schema = {
    navigation: "none",
    pages: [
        {
            legend: "Build a form",
            intro: "Building an ExoForm schema",
            fields: [
                {
                    id: "action",
                    name: "action",
                    type: "radiobuttonlist",
                    asview: "tiles",
                    class: "compact",
                    caption: "Select how you want to get started",
                    items: [
                        {
                            name: "Start with a template",
                            description: "Load one of the existing templates and take it from there",
                            value: 2
                        },
                        {
                            name: "Start with a data schema/DTO",
                            description: "Generate a Form schema from your data definition (JSON)",
                            value: 1
                        },
                        {
                            name: "Advanced",
                            description: "Start from scratch and show the Form Schema Editor",
                            value: 0
                        }
                    ],
                    "rules": [
                        {
                            description: "Go to template loader when action 2 is selected",
                            type: "goto",
                            page: 3,
                            expression: [
                                "action",
                                "change",
                                "value",
                                "==",
                                "2"
                            ]
                        },
                        {
                            description: "Go to DTO chooser when action 1 is selected",
                            type: "goto",
                            page: 2,
                            expression: [
                                "action",
                                "change",
                                "value",
                                "==",
                                "1"
                            ]
                        },
                        {
                            type: "customMethod",
                            method: "emptyFormSchema",
                            expression: [
                                "action",
                                "change",
                                "value",
                                "==",
                                "0"
                            ]
                        }
                    ]
                }
            ]
        },
        {
            legend: "Data",
            intro: "Load your DTO",
            fields: [
                {
                    id: "import",
                    name: "import",
                    type: "filedrop",
                    caption: "Select JSON",
                    max: 1,
                    fileTypes: [
                        "application/json"
                    ],
                    maxSize: 10240
                },
                {
                    name: "dto",
                    type: "aceeditor",
                    mode: "json",
                    caption: "DTO",
                    rules: [
                        {
                            type: "customMethod",
                            method: "importSchema",
                            expression: [
                                "import",
                                "change",
                                "value",
                                "!=",
                                ""
                            ]
                        }
                    ]
                },
                {
                    name: "generate",
                    type: "button",
                    icon: "ti-wand",
                    click: "generateFromSchema",
                    caption: "Generate Form Schema"
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
                    type: "radiobuttonlist",
                    //view: "tiles",
                    caption: "ExoForm Template",
                    items: [
                        {
                            name: "Starter Form",
                            value: "/data/forms/templates/empty.json",
                            description: "A Simple 1 field form to get started with"
                        },
                        {
                            name: "Contact Form",
                            value: "/data/forms/templates/contact.json",
                            description: "Illustrating the use of the combined 'name' &amp; 'nladdress' fields.",
                            "tooltip": "Use of the 'multiinput' control that can be used to build a set of related fields"
                        },
                        {
                            name: "Wizard",
                            value: "/data/forms/templates/wizard.json",
                            description: "A Simple multi-page form that shows how you can build wizards"
                        },
                        {
                            name: "Survey",
                            value: "/data/forms/templates/survey.json",
                            description: "A TypeForm-like survey, with one element at a time shown to the user"
                        },
                        {
                            name: "MultiInput Test",
                            value: "/data/forms/templates/multiinput-test.js",
                            description: "An example of the use of the multiinput control to collect related data"
                        },
                        {
                            name: "Complex Form with conditional logic",
                            value: "/data/forms/templates/complex.json",
                            description: "A multi-page form with interdepedencies, using the ExoForm Rules engine"
                        },
                        {
                            name: "Model Binding",
                            value: "/data/forms/templates/model-binding.json",
                            description: "A form that shows how to use model binding"
                        },
                        {
                            name: "Advanced: custom control states",
                            value: "/data/forms/templates/custom-nav-state.js",
                            description: "A complete example of Model Data Binding combined with JS logic and custom navigation controls bound to state in the model."
                        }
                    ]
                },
                {
                    name: "selectTemplate",
                    type: "button",
                    click: "selectTemplate",
                    caption: "Start with this template",
                    rules: [
                        {
                            type: "enabled",
                            expression: [
                                "template",
                                "change",
                                "value",
                                "!=",
                                "undefined"
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}
