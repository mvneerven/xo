
import ExoFormFactory from '../core/ExoFormFactory';
import Core from '../../pwa/Core';
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
        this.events = new Core.Events(this);
        this._init(exo, instance);
        this._resolver = new ExoFormDataBindingResolver(this);

        exo.on(ExoFormFactory.events.renderStart, e => { // run logic for initial state of controls
            this.resolver._checkSchemaLogic();
        })

        exo.on(ExoFormFactory.events.renderReady, e => {
            exo.on(ExoFormFactory.events.dataModelChange, e => {
                this.resolver.resolve();
            }).on(ExoFormFactory.events.page, e=>{ // on navigate, resolve again (e.g. for navigation control state)
                this.resolver.resolve();
            })
            this.resolver.resolve();
        })
        
        this._ready();
    }

    get resolver() {
        return this._resolver;
    }

    _ready() {
        const exo = this.exo;
        exo.on(ExoFormFactory.events.schemaLoaded, () => {
            let data = {};

            const modelSetup = [ExoFormDataBinding.origins.bind, ExoFormDataBinding.origins.schema].includes(this._origin);
            console.log("Model set up: " + modelSetup);

            exo.query(f => {

                if (f.name) {
                    if (!f.bind && !modelSetup) {
                        f.bind = "instance.data." + f.name; // use default model binding if no binding is specified
                    }
                    if (f.bind) { // field uses databinding to model
                        f.value = (modelSetup ? this.get(f.bind) : f.value) || "";
                        console.debug("ExoFormDatabinding: applying instance." + f.name, f.bind, f.value);
                        data[f.name] = f.value
                    }
                }
            }, {
                includeControls: true // navigation buttons are not normally included
            });

            // make sure we have a model if it wasn't passed in
            if (!modelSetup) {
                console.log("Fill initial model", data);
                this._model.instance.data = data;
            }

            console.log("Firing Model ready event ", this._model.instance);

            this.events.trigger("ready", { model: this._model });
        })
            .on(ExoFormFactory.events.interactive, () => {
                exo.form.addEventListener("change", e => {
                    let field = ExoFormFactory.getFieldFromElement(e.target, {
                        master: true // lookup master if nested
                    });
                    if (field && field.bind) {
                        let value = field._control.value;
                        Core.setObjectValue(this._model, field.bind, value);
                        //console.log("Model Instance changed", field.bind, value, this._model.instance);

                        if (this._mapped) {
                            // map back
                            this._mapped = this._model.instance;
                        }

                        this.events.trigger("change", {
                            model: this._model,
                            changed: field.bind,
                            value: value
                        });
                    }
                })
            })
    }

    _signalDataBindingError(ex) {
        this.events.trigger("error", { exo: this.exo, error: ex });
    }

    get(path, defaultValue) {
        let returnValue = null;
        try {
            returnValue = Core.getObjectValue(this._model, path, defaultValue);
        }
        catch (ex) {
            this._signalDataBindingError(ex);
        }
        return returnValue;
    }

    _init(exo, instance) {

        if (instance) {
            this._mapped =  instance;
            this._model.instance = instance;
            this._origin = ExoFormDataBinding.origins.bind;
        }
        else if (exo.schema.model) {
        
            this._origin = ExoFormDataBinding.origins.schema;
            this._model = {
                ...exo.schema.model
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

    _processFieldProperty(control, name, value) {
        let returnValue = value;
        if (typeof (value) === "string" && value.startsWith("@")) {

            let path = value.substring(1);
            console.debug("ExoFormDatabinding: resolving databound control property", name, value, "path:", path);

            

            returnValue = this.get(path, undefined);
            if (returnValue === undefined) {
                
                returnValue = value  // return original string, don't resolve
            }
            else {
                console.debug("ExoFormDatabinding: resolved databound control property", name, value, ": >", returnValue , "<");

                this.resolver.addBoundControl({
                    control: control,
                    field: control.context.field,
                    path: path,
                    propertyName: name,
                    originalBoundValue: returnValue
                });
            }
        }

        return returnValue;
    }

}

export default ExoFormDataBinding;
