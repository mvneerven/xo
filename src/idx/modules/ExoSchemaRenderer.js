import ExoFormSchemaModel from './ExoFormSchemaModel';

const Core = window.xo.core;

class ExoSchemaRenderer {

    constructor(builder) {
        this.builder = builder;
        this.events = new Core.Events(this);
        this.cache = this.builder.workspace.get("xo-schema");

        this._model = new ExoFormSchemaModel(this.builder.exoContext);
    }

    restoreCache(){
        this._model.restoreCache(this.cache);
    }

    get model() {
        return this._model;
    }

    async render() {
        const me=  this;
        let schema = me.getSchema();

        let frm = await xo.form.run(schema, {
            context: this.builder.exoContext,
            on: {
                created: e=> {
                    me.exo = e.detail.host 
                    me.events.trigger("created", { exo: me.exo });
                },
                
                schemaLoaded: e=>{
                    me.events.trigger("schemaloaded", { exo: me.exo })
                },
                
                error: ex => {
                    
                    this.events.trigger("error", {
                        error: ex.detail.error
                    })
                },
                post: e => {
                    this.events.trigger("post", e.detail)
                }
            }
        })

        me.events.trigger("ready", {
            exo: me.exo,
            form: frm
            
        })

    }

    getSchema() {
        // string conversion needed to lose runtime-added schema properties (id, binding, class, etc..)
        let sc = this.builder.exoContext.createSchema();
        sc.parse(this.model.schema);
        return sc.toString();
    }
}

export default ExoSchemaRenderer;