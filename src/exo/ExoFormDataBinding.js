
import ExoFormFactory from './ExoFormFactory';
import Core from '../pwa/Core';
import ExoFormDataBindingResolver from './ExoFormDataBindingResolver';

class ExoFormDataBinding {

    static origins = {
        schema: "schema",
        bind: "bind",
        none: "none"
    }

    _model = {
        instance: {},
        bindings: {}
    };

    constructor(exo, instance) {
        this.exo = exo;
        Core.addEvents(this); // add simple event system

        this._init(exo, instance);

        exo.on(ExoFormFactory.events.renderReady, e => {

            const resolver = new ExoFormDataBindingResolver(this);

            exo.on(ExoFormFactory.events.dataModelChange, e => {
                resolver.resolve();
            })

            resolver.resolve();

        })
        this._ready();
    }

    _ready() {
        const exo = this.exo;
        exo.on(ExoFormFactory.events.schemaLoaded, () => {
            let data = {};

            exo.query(f => {

                if (f.name) {
                    f.bind = f.bind || "instance.data." + f.name; // use default model binding if no binding is specified
                    f.value = this.get(f.bind, f.value);
                    console.log("Applying instance." + f.name, f.bind, f.value);
                    data[f.name] = f.value
                }
            });

            // make sure we have a model if it wasn't passed in
            if (this._origin === ExoFormDataBinding.origins.none) {
                console.log("Fill initial model", data);
                this._model.instance.data = data;
            }

            console.log("Firing Model ready event ", this._model.instance);

            this._triggerEvent("ready", { model: this._model });
        })
            .on(ExoFormFactory.events.interactive, () => {
                exo.form.addEventListener("change", e => {

                    let field = ExoFormFactory.getFieldFromElement(e.target, {
                        master: true // lookup master if nested
                    });
                    if (field && field.bind) {
                        let value = field._control.value;
                        Core.setObjectValue(this._model, field.bind, value);
                        console.log("Model Instance changed", field.bind, value, this._model.instance);

                        if (this._mapped) {
                            // map back
                            this._mapped = this._model.instance;
                        }

                        this._triggerEvent("change", {
                            model: this._model,
                            changed: field.bind,
                            value: value
                        });
                    }
                })
            })
    }

    _triggerEvent(eventName, detail, ev) {
        console.debug("Triggering event", eventName, "detail: ", detail)
        if (!ev) {
            ev = new Event(eventName, { bubbles: false, cancelable: true });
        }

        ev.detail = {
            app: this,
            ...(detail || {})
        };

        return this.dispatchEvent(ev);
    }

    _signalDataBindingError(ex){
        this._triggerEvent("error", {exo: this.exo, error: ex});
    }

    get(path, defaultValue) {
        return Core.getObjectValue(this._model, path, defaultValue);
    }

    on(eventName, func) {
        console.debug("Listening to event", eventName, func);
        this.addEventListener(eventName, func);
        return this;
    }

    _init(exo, model) {

        if (model) {
            this._mapped = model;
            this._model.instance = model;
            this._origin = ExoFormDataBinding.origins.bind;
        }
        else if (exo.formSchema.model) {
            this._origin = ExoFormDataBinding.origins.schema;
            this._model = {
                ...exo.formSchema.model
            };
            this._model.bindings = this._model.bindings || {}
        }
        else {
            this._origin = ExoFormDataBinding.origins.none;
        }
    }

    toString() {
        return JSON.stringify(this.model, null, 2);
    }

    get model() {

        if (!this._instanceInitialized) {
            try {
                if (this._origin === ExoFormDataBinding.origins.none) {
                    let obj = this.exo.getFormValues();
                    this._model.instance = { data: obj }
                }
            }
            catch { }
            finally {
                this._instanceInitialized = true;
                this._model.instance = this._model.instance || { data: {} }
            }
        }

        return this._model;
    }

}

export default ExoFormDataBinding;
