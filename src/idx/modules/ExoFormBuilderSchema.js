const DOM = window.xo.dom;

class ExoFormBuilderSchema {
    constructor(builder) {
        this.builder = builder;
    }

    render(container) {
        
        xo.form.run("/data/forms/start.js", {
            on: {
                action: {
                    selectTemplate: obj => {
                        fetch(obj.template).then(x => x.text()).then(text => {
                            _.builder.loadSchemaInEditor(text);
                            this.builder.renderer.model.load(text);
                            this.builder.tabStrip.tabs.schema.select();
                        })
                    }
                }
            }
        }).then(x=>{
            container.appendChild(x);
        })
    }
}

export default ExoFormBuilderSchema;