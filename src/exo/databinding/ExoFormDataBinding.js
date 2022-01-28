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

    _model = {};

    constructor(exo) {
        this.exo = exo;
        this.events = new Core.Events(this);
    }

    async prepare() {
        await this._init(this.exo);

        this._resolver = new ExoFormDataBindingResolver(this);

        this.exo.on(ExoFormFactory.events.renderStart, e => { // run logic for initial state of controls
            this.resolver._checkSchemaLogic();

        })

        this.exo.on(ExoFormFactory.events.renderReady, e => {
            this.resolver.resolve();

            this.exo.on(ExoFormFactory.events.dataModelChange, e => {
                this.resolver.resolve(e.detail.changeData);
            })

        })

        this.exo.on(ExoFormFactory.events.interactive, e => {
            this.resolver.resolve();
        })

        this._ready();
    }

    setupDefaultButtonBinding(btn) {
        let id = btn.context.field.name || btn.context.field.id;
        btn.context.field._defaultValue = -1;
        if (!this.model.instance.btnstates) {
            let btnInst = {}
            btnInst[id] = "auto";
            this.model.instance.btnstates = this.proxy('btnstates', btnInst); // Proxy to monitor changes
        }
        btn.context.field.bind = "#/btnstates/" + id
    }

    get resolver() {
        return this._resolver;
    }

    _ready() {
        const exo = this.exo;
        exo.on(ExoFormFactory.events.schemaLoaded, () => {
            let data = {};
            const modelSetup = [
                ExoFormDataBinding.origins.bind,
                ExoFormDataBinding.origins.schema
            ].includes(this._origin);

            // make sure we have a model if it wasn't passed in
            if (!modelSetup) {
                this._model.instance.data = data;
            }
            this.events.trigger("ready", { model: this._model });
        })
            .on(ExoFormFactory.events.interactive, () => {

                console.debug("Bindings", this.resolver._boundControlState)
                let eventName = this.exo.options.DOMChange || "input";

                const handleChange = e => {
                    if (this.noProxy) {
                        console.debug("ExoFormDataBinding", "DOMChange event SKIPPED BECAUSE NO-PROXY")
                        return
                    }

                    let ctl = xo.control.get(e.target, true)
                    console.debug("DataModel change event detected on ", ctl.toString())

                    if (ctl) {

                        let bind = ctl.context.field.bind;
                        if (bind) {
                            if (!ctl.valid) {
                                return; // don't update model if the value isn't valid
                            }
                            console.debug("DataModel change handling in ", ctl.toString())
                            let value = ctl.value;
                            Core.setObjectValue(this._model, bind, value);
                            if (this._mapped) {
                                this._mapped = this._model.instance; // map back
                            }
                        }
                    }
                    else {
                        console.warn("No control found for change in ", e.target)
                    }
                }

                exo.form.addEventListener("change", handleChange);

                if (eventName === "input")
                    exo.form.addEventListener(eventName, handleChange)
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
            throw TypeError(`${path} not set`)
        }
        return returnValue;
    }

    set(path, value) {
        if (typeof (value) === "string" && value.startsWith("#/"))
            value = this.get(value);

        try {
            Core.setObjectValue(this._model, path, value);
        }
        catch (ex) {
            throw TypeError(`Could not set ${path}: ${ex.message}`);
        }
    }

    remove(path, index, count) {
        let array = xo.core.clone(Core.getObjectValue(this._model, path));
        array.splice(index, count);
        Core.setObjectValue(this._model, path, array)
    }

    async _init(exo) {

        return new Promise(resolve => {

            if (exo.schema.model) {
                this._origin = ExoFormDataBinding.origins.schema;

                this._model = {
                    ...exo.schema.model
                };

                let keys = Object.keys(this._model.instance);

                let promises = [];

                const fetchInstance = async (key, ins) => {
                    console.debug("Fetching instance from URL: " + ins)
                    ins = await Core.acquireState(ins);
                    console.debug("Fetched instance from URL: " + ins)
                    this._model.instance[key] = this.proxy(key, ins); // Proxy to monitor changes
                }

                keys.forEach(async key => {
                    let ins = this._model.instance[key];
                    if (Core.isUrl(ins)) {
                        promises.push(fetchInstance(key, ins))
                    }
                    else {
                        this._model.instance[key] = this.proxy(key, ins); // Proxy to monitor changes
                    }
                })

                Promise.all(promises).then(() => {
                    resolve();
                });
            }
            else {
                this._origin = ExoFormDataBinding.origins.none;
                resolve();
            }
        });
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

        const equals = (x, y) => {
            if (Array.isArray(x))
                return arrayEquals(x, y);
            if (typeof (x) === "object")
                return Core.objectEquals(x, y)
            return x === y;
        }

        const arrayEquals = (a, b) => {
            return Array.isArray(a) &&
                Array.isArray(b) &&
                a.length === b.length &&
                a.every((val, index) => val === b[index]);
        }

        const proxify = (instanceName, object, changeHandler, subPath, stackCount) => {
            const pxy = new Proxy(object, {
                get: function (target, key) {
                    //console.log("Proxy.get", "target:", target, "key:", key);
                    if (typeof target[key] === 'object' && target[key] !== null) {
                        return proxify(instanceName, target[key], changeHandler, subPath + "/" + key, stackCount++)
                    } else {
                        return target[key];
                    }
                },
                set: function (target, key, value) {
                    if (equals(target[key], value)) return true
                    //console.log("Proxy.set", "target:", target, "key:", key, "value:", value);
                    var old = Core.clone(target[key]);
                    target[key] = value;

                    changeHandler(target, key, old, value, subPath, stackCount);

                    return true;
                }
            });
            return pxy;
        }

        const changeHandler = (target, key, oldValue, newValue, subPath, stackCount) => {
            if (equals(oldValue, newValue)) return

            const isArray = Array.isArray(target);

            // set change path for binding
            const path = !isArray && key
                ? `#/${instanceName}${subPath}/${key}`
                : `#/${instanceName}${subPath}`;

            if (isArray) {
                console.debug(`DataModel: array '${path}' changed`);
            }
            else {
                console.debug(`DataModel: '${path}' changed from`, oldValue, 'to', newValue === "" ? '""' : newValue);
            }

            if (!me.noProxy) {
                const change = {
                    path: path,
                    model: me._model,
                    instanceName: instanceName,
                    object: target,
                    property: key,
                    oldValue: oldValue,
                    newValue: newValue,
                }

                change.log = me.verboseLog(change);
                me.events.trigger("change", {
                    model: me._model,
                    changed: key,
                    value: newValue,
                    changeData: change

                });
                me.resolver.resolve(change);
            }
        };

        return proxify(instanceName, obj, changeHandler, "", 0);
    }

    verboseLog(change) {
        let s = `Property ${change.path} changed from ${change.oldValue} to ${change.newValue}.`
        return s;
    }

    static isVariable(value) {
        return (typeof (value) === "string" && value.startsWith("#/"))
    }

    _processFieldProperty(control, name, value, callback) {
        let returnValue = value;

        if (ExoFormDataBinding.isVariable(value)) {
            let path = value;

            this.ensureInstancePropertyExists(path)

            returnValue = this.get(path, undefined);
            if (returnValue === undefined) {
                returnValue = value  // return original string, don't resolve
            }
            else {
                if(name === "bind")
                    name = "value";

                if (!["type", "name"].includes(name)) {
                    this.resolver.addBoundControl({
                        control: control,
                        field: control.context.field,
                        path: path,
                        callback: callback,
                        propertyName: name,
                        originalBoundValue: returnValue
                    });
                }
            }
        }
        return returnValue;
    }

    // ensure a bound property exists on the instance,
    // in order for databinding to work properly
    ensureInstancePropertyExists(bind) {

        let old = this.noProxy;

        this.noProxy = true

        try {
           let instanceName = ExoFormDataBinding.getInstanceFromBind(bind)

            if (!this.model.instance[instanceName]) {
                this.model.instance[instanceName] = {}
            }

            if (!Core.getObjectValue(this._model, bind)) {
                let initialValue = null;
                Core.setObjectValue(this._model, bind, initialValue);
            }
        }

        finally {
            this.noProxy = old;
        }
    }

    static getInstanceFromBind(bind){
        let b = Core.translateBindingPath(bind).substring(9);
        return b.split('.')[0];
    }
}

export default ExoFormDataBinding;
