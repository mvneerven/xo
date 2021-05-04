
import ExoFormFactory from './ExoFormFactory';
import Core from '../pwa/Core';

class ExoFormModel {

    static origins = {
        schema: "schema",
        bind: "bind",
        none: "none"
    }

    _data = {
        instance: {}
    };

    constructor(exo, instance) {
        this.exo = exo;
        Core.addEvents(this); // add simple event system

        this._init(exo, instance);
        this._ready();
    }

    _ready() {
        const exo = this.exo;
        exo.on(ExoFormFactory.events.schemaLoaded, () => {
            let data = {};

            exo.query(f => {

                if (f.name) {
                    f.bind = f.bind || "data." + f.name; // use default model binding if no binding is specified
                    f.value = this.get(f.bind, f.value);


                    console.log("Applying model data", f.name, f.bind, f.value);
                    data[f.name] = f.value
                }
            });

            // make sure we have a model if it wasn't passed in
            if (this._origin === ExoFormModel.origins.none) {
                console.log("Fill initial model", data);
                this._data.instance.data = data;
            }

            console.log("Firing Model ready event ", this._data.instance);

            this._triggerEvent("ready", {
                instance: this._data.instance
            });
        })
            .on(ExoFormFactory.events.interactive, () => {
                exo.form.addEventListener("change", e => {
                    let field = ExoFormFactory.getFieldFromElement(e.target, {
                        master: true // lookup master if nested
                    });
                    if (field && field.bind) {
                        let value = field._control.value;
                        Core.setObjectValue(this._data.instance, field.bind, value);
                        console.log("Model Instance changed", field.bind, value, this._data.instance);

                        if (this._mapped) {
                            // map back
                            this._mapped = this._data.instance;
                        }

                        this._triggerEvent("change", {
                            instance: this._data.instance,
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
            ev = new Event(eventName, { "bubbles": false, "cancelable": true });
        }

        ev.detail = {
            app: this,
            ...(detail || {})
        };

        return this.dispatchEvent(ev);
    }

    get(path, defaultValue) {
        return Core.getObjectValue(this._data.instance, path, defaultValue);
    }

    on(eventName, func) {
        console.debug("Listening to event", eventName, func);
        this.addEventListener(eventName, func);
        return this;
    }

    _init(exo, model) {

        if (model) {
            this._mapped = model;
            this._data.instance = model;
            this._origin = ExoFormModel.origins.bind;
        }
        else if (exo.formSchema.model) {
            this._origin = ExoFormModel.origins.schema;
            this._data = {
                ...exo.formSchema.model
            };
        }
        else {
            this._origin = ExoFormModel.origins.none;
        }
    }

    toString() {
        return JSON.stringify(this.instance, null, 2);
    }

    get instance() {

        if (!this._instanceInitialized) {
            try {
                if (this._origin === ExoFormModel.origins.none) {
                    let obj = this.exo.getFormValues();
                    this._data.instance = { data: obj }
                }
            }
            catch { }
            finally {
                this._instanceInitialized = true;
                this._data.instance = this._data.instance || { data: {} }
            }
        }

        return this._data.instance;
    }
}

export default ExoFormModel;
