import ExoFormSchemaModel from './ExoFormSchemaModel';

class ExoSchemaRenderer {
    constructor(builder) {
        this.builder = builder;
        this.events = new xo.core.Events(this);
        this.cache = this.builder.workspace.get("xo-schema");

        this._model = new ExoFormSchemaModel(this.builder.exoContext);
        this._data = {};
    }

    restoreCache() {
        this._model.restoreCache(this.cache);
    }

    get model() {
        return this._model;
    }

    get data(){
        return this._data
    }

    async render() {
        const me = this;
        let schema = me.getSchema();

        let frm = await xo.form.run(schema, {
            context: this.builder.exoContext,
            on: {
                
                schemaLoaded: e => {
                    me.exo = e.detail.host
                    me.events.trigger("created", { exo: me.exo });
                    me.events.trigger("schemaloaded", { exo: me.exo })
                },

                dataModelChange: e => {
                    //me.events.trigger("dataModelChange", { exo: me.exo })
                    this._data.model = me.exo.dataBinding?.model?.instance || {};
                    me.events.trigger("dataChange");
                },

                error: ex => {

                    this.events.trigger("error", {
                        error: ex.detail.error
                    })
                },
                post: e => {
                    //this.events.trigger("post", e.detail)

                    //this.postData = e.detail.postData
                    this._data.post = e.detail.postData;
                    me.events.trigger("dataChange");
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