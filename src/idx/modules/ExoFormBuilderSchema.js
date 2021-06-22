const DOM = window.xo.dom;

class ExoFormBuilderSchema {
    constructor(builder) {
        this.builder = builder;
    }

    render(container) {
        const _ = this;

        _.builder.exoContext.createForm({
            customMethods: {
                emptyFormSchema: obj => {
                    _.builder.tabStrip.tabs.schema.select();
                },
                importSchema: obj => {
                    if (obj.event.detail && obj.event.detail.data) {
                        let uploadData = obj.event.detail.data[0].b64;
                        var decodedData = window.atob(uploadData);
                        obj.field._control.value = decodedData;


                        this.builder.renderer.model.schema = decodedData;
                        
                    }
                },
                generateFromSchema: obj => {
                    let result = _.builder.exoContext.createGenerator().generateFormSchema(obj.dto);
                    var schema = JSON.stringify(result, null, 2);
                    this.builder.loadSchemaInEditor(schema);
                    this.builder.tabStrip.tabs.schema.select();
                },
                selectTemplate: obj => {
                    fetch(obj.template).then(x => x.text()).then(text => {
                        _.builder.loadSchemaInEditor(text);

                        this.builder.renderer.model.load(text);

                        this.builder.tabStrip.tabs.schema.select();
                    })

                }
            }
        })
            .load("/data/forms/start.js")
            .then(x => x.renderForm())
            .then(x => {
                container.appendChild(x.container);

                x.renderSingleControl({
                    type: "button",
                    title: "Reset",
                    icon: "ti-close",
                    caption: "",
                    class: "btn btn-asf abs-top-right",
                    click: e => {
                        x.addins.navigation.restart();
                        x.form.reset();
                    }
                }).then(b => {
                    container.insertBefore(b, x.container)
                })

            });
    }
}

export default ExoFormBuilderSchema;