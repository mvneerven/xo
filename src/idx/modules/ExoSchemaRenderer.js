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

    render() {


        let schema = this.getSchema();

        const x = this.builder.exoContext.createForm();
        this.events.trigger("created", { exo: x });

        x.on(window.xo.form.factory.events.post, e => {
            this.events.trigger("post", e.detail)
        })

            .load(schema).then(x => {
                this.events.trigger("schemaloaded", { exo: x })
                return x;
            })
            .then(x => x.renderForm()).then(x => {
                this.events.trigger("ready", {
                    exo: x
                })
            }).catch(ex => {
                this.events.trigger("error", {
                    error: ex
                })
            }).finally(() => {
                //this.updateWorkspaceSchema();
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