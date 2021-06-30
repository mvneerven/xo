const DOM = xo.dom;
const Core = xo.core;

class ExoFormBuilderSchema {
    constructor(builder) {
        this.builder = builder;
    }

    render(container) {
        
        xo.form.run("/data/forms/start.js", {
            on: {
                action: e=> {
                    let exo = e.detail.host;
                    let model = exo.dataBinding.model;

                    switch(e.detail.action){

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
        }).then(x=>{
            container.appendChild(x);
        })
    }
}

export default ExoFormBuilderSchema;