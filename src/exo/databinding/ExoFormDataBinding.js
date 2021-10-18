import ExoFormFactory from '../core/ExoFormFactory';
import Core from '../../pwa/Core';
import ExoFormDataBindingResolver from './ExoFormDataBindingResolver';
import ExoFormSchema from '../core/ExoFormSchema';

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
        this.instance = instance;
        this.events = new Core.Events(this);
    }

    async prepare(){
        this._init(this.exo, this.instance).then(() => {

            this._resolver = new ExoFormDataBindingResolver(this);

            this.exo.on(ExoFormFactory.events.renderStart, e => { // run logic for initial state of controls
                this.resolver._checkSchemaLogic();
            })

            this.exo.on(ExoFormFactory.events.renderReady, e => {
                this.exo.on(ExoFormFactory.events.dataModelChange, e => {
                    this.resolver.resolve();
                }).on(ExoFormFactory.events.page, e => { // on navigate, resolve again (e.g. for navigation control state)
                    this.resolver.resolve();
                })
                this.resolver.resolve();
            })

            this._ready();
        });
    }

    get resolver() {
        return this._resolver;
    }

    _ready() {
        const exo = this.exo;
        exo.on(ExoFormFactory.events.schemaLoaded, () => {
            let data = {};

            const modelSetup = [ExoFormDataBinding.origins.bind, ExoFormDataBinding.origins.schema].includes(this._origin);


            exo.query(f => {
                if (!f.bind && !modelSetup) {
                    if (f.name) {
                        f.bind = "instance.data." + f.name; // use default model binding if no binding is specified
                    }
                }
                if (f.bind) { // field uses databinding to model -> set databinding value
                    f.name = f.name || ExoFormSchema.getPathFromBind(f.bind);
                    f.defaultValue = f.value;
                    f.value = (modelSetup ? this.get(f.bind) : f.value) || "";
                    console.debug("DataModel: bind " + f.name, f.bind, f.value);
                    data[f.name] = f.value
                }

            }, {
                includeControls: true // navigation buttons are not normally included
            });

            // make sure we have a model if it wasn't passed in
            if (!modelSetup) {
                this._model.instance.data = data;
            }

            this.events.trigger("ready", { model: this._model });
        })
            .on(ExoFormFactory.events.interactive, () => {
                let eventName = this.exo.options.DOMChange || "input";

                const handle = e => {
                    if (this.noProxy) {
                        console.debug("ExoFormDataBinding", "DOMChange event SKIPPED BECAUSE NO-PROXY")
                        return
                    }

                    let field = ExoFormFactory.getFieldFromElement(e.target, {
                        master: true // lookup master if nested
                    });
                    if (field && field.bind) {

                        if (!field._control.valid) {
                            return; // don't update model if the value isn't valid
                        }

                        console.debug("DataModel change handling in ", ExoFormFactory.fieldToString(field))

                        let value = field._control.value;
                        Core.setObjectValue(this._model, field.bind, value);
                        if (this._mapped) {
                            this._mapped = this._model.instance; // map back
                        }
                    }
                }

                exo.form.addEventListener("change", handle);

                if (eventName === "input")
                    exo.form.addEventListener(eventName, handle)
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
            throw TypeError(`DataBinding.get() - error on ${path}` )
            //this._signalDataBindingError(ex);
        }
        return returnValue;
    }

    set(path, value){
        if(typeof(value) === "string" && value.startsWith("#/"))
            value = this.get(value);
            
        try {
            Core.setObjectValue(this._model, path, value);            
        }
        catch (ex) {
            //this._signalDataBindingError(ex);
            throw TypeError(`DataBinding.set() - error on ${path}` )
        }
        
    }

    async _init(exo, instance) {
        if (instance) { //TODO deprecate
            this._mapped = instance;
            this._model.instance = instance;
            this._origin = ExoFormDataBinding.origins.bind;
        }
        else if (exo.schema.model) {
            this._origin = ExoFormDataBinding.origins.schema;
            this._model = {
                ...exo.schema.model
            };

            for (var n in this._model.instance) {
                let ins = this._model.instance[n];
                if (Core.isUrl(ins)) {
                    ins = await Core.acquireState(ins);
                }

                this._model.instance[n] = this.proxy(n, ins); // Proxy to monitor changes
            }

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
                this._model.instance = this._model.instance || { data: {} };
            }
        }

        return this._model;
    }


    proxy(instanceName, obj) {
        const me = this;
        
        const proxify = (instanceName, object, change, subPath) => {
            if (object && object.__proxy__) {
                return object;
            }
            const pxy = new Proxy(object, {
                get: function (object, name) {
                    if (name === '__proxy__') {
                        return true;
                    }
                    return object[name];
                },
                set: function (object, name, value) {
                    var old = object[name];
                    if (value && typeof value === 'object') {
                        // new object need to be proxified as well
                        value = proxify(instanceName, value, change, subPath + "/" + name);
                    }
                    object[name] = value;
                    if (old !== value) {
                        
                        change(object, name, old, value, subPath);// + "/" + name);
                    }
                    return true;
                }
            });
            for (var prop in object) {
                if (object.hasOwnProperty(prop) && object[prop] &&
                    typeof object[prop] === 'object') {
                    // proxify all child objects
                    
                    object[prop] = proxify(instanceName, object[prop], change, subPath + "/" + prop);
                }
            }
            return pxy;
        }

        return proxify(instanceName, obj, (object, property, oldValue, newValue, subPath) => {
            
            const path = `#/${instanceName}${subPath}/${property}`;

            console.debug(`DataModel: '${path}' changed from ${oldValue} to ${newValue}`);

            if (!me.noProxy) {
                const change = {
                    path: path,
                    model: me._model,
                    instanceName: instanceName,
                    object: object,
                    property: property,
                    oldValue: oldValue,
                    newValue: newValue,
                }

                change.log = me.verboseLog(change);
                me.events.trigger("change", {
                    model: me._model,
                    changed: property,
                    value: newValue,
                    changeData: change

                });
                me.resolver.resolve(change);
            }
        }, "");
    }

    verboseLog(change) {
        let s = `Property ${change.path} changed from ${change.oldValue} to ${change.newValue}.`
        return s;
    }

    _processFieldProperty(control, name, value) {
        let returnValue = value;

        if (typeof (value) === "string") {

            let isVarRef = value.startsWith("#/");

            if (isVarRef || name === "bind" && value.startsWith("#/") ) {

                let path = value;//isVarRef ? value.substring(1) : value;

                returnValue = this.get(path, undefined);
                if (returnValue === undefined) {

                    returnValue = value  // return original string, don't resolve
                }
                else {

                    this.resolver.addBoundControl({
                        control: control,
                        field: control.context.field,
                        path: path,
                        propertyName: name,
                        originalBoundValue: returnValue
                    });
                }
            }
        }
        else if (typeof (value) === 'object') {

            for (var p in value) {
                if (typeof (value[p]) == "string" && value[p].indexOf("@") >= 0) {
                   // debugger;
                }
                returnValue[p] = this._processFieldProperty(control, p, returnValue[p])
                if (value[p] !== returnValue[p]) {
                   // debugger;
                }
            }
        }

        return returnValue;
    }

}

export default ExoFormDataBinding;
