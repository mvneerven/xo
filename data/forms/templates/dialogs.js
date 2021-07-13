const schema = {
    model: {
        logic: e => {
            if (e.changed.property === "button") {
                // e.changed.newValue 
            }
        },
        instance: {
            control: {
                button: ""
            }
        }
    },
    pages: [
        {
            fields: [
                {
                    type: "button",
                    name: "show",
                    caption: "Show dialog! @instance.control.button",
                    action: "dialog:dlg1"
                }, {
                    name: "dlg1",
                    body: "Test dialog!",
                    caption: "Test Field",
                    type: "dialog",
                    bind: "instance.control.button"
                }
            ]
        }
    ]
}