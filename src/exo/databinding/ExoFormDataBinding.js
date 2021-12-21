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
            this.exo.on(ExoFormFactory.events.dataModelChange, e => {
                this.resolver.resolve(e.detail.changeData);
            }).on(ExoFormFactory.events.page, e => { // on navigate, resolve again (e.g. for navigation control state)
                this.resolver.resolve();
            })
            this.resolver.resolve();

        })

        this._ready();
    }

    setupDefaultButtonBinding(btn) {
        let id = btn.context.field.name || btn.context.field.id;
        btn.context.field.defaultValue = -1;
        if (!this.model.instance.btnstates) {
            this.model.instance.btnstates = {};
            this.model.instance.btnstates[id] = "auto";
            this.model.instance.btnstates = this.proxy('btnstates', this.model.instance.btnstates); // Proxy to monitor changes
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

            const modelSetup = [ExoFormDataBinding.origins.bind, ExoFormDataBinding.origins.schema].includes(this._origin);


            exo.query(f => {
                if (!f.bind && !modelSetup) {
                    if (f.name) {
                        f.bind = "#/data/" + f.name; // use default model binding if no binding is specified
                    }
                }
                if (f.bind) { // field uses databinding to model -> set databinding value
                    f.name = f.name || ExoFormSchema.getPathFromBind(f.bind);
                    f.defaultValue = f.value;
                    f.value = (modelSetup ? this.get(f.bind) : f.value) || "";
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

                console.debug("Bindings", this.resolver._boundControlState)


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

    remove(path, index, count){
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

        const proxify = (instanceName, object, changeHandler, subPath) => {
            const pxy = new Proxy(object, {
                get: function (target, key) {
                    //console.log("Proxy.get", "target:", target, "key:", key);
                    if (typeof target[key] === 'object' && target[key] !== null) {
                        return proxify(instanceName, target[key], changeHandler, subPath + "/" + key)
                    } else {
                        return target[key];
                    }
                },
                set: function (target, key, value) {
                    if (equals(target[key], value)) return true
                    //console.log("Proxy.set", "target:", target, "key:", key, "value:", value);
                    var old = Core.clone(target[key]);
                    target[key] = value;
                                        
                    changeHandler(target, key, old, value, subPath);
                    
                    return true;
                }
            });
            return pxy;
        }

        const changeHandler = (target, key, oldValue, newValue, subPath) => {
            if (equals(oldValue, newValue)) return

            const isArray = Array.isArray(target);

            // set change path for binding
            const path = !isArray && key 
                ? `#/${instanceName}${subPath}/${key}` 
                : `#/${instanceName}${subPath}`;

            if(isArray){
                console.debug(`DataModel: array '${path}' changed`);
            }
            else{
                console.debug(`DataModel: '${path}' changed from`, oldValue, 'to', newValue === "" ? '""': newValue);
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

    _processFieldProperty(control, name, value) {
        let returnValue = value;

        if (typeof (value) === "string") {

            let isVarRef = value.startsWith("#/");

            if (isVarRef) {// (isVarRef || name === "bind" && value.startsWith("#/")) {
                console.debug("Resolving ", value);

                let path = value;

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
        // else if (typeof (value) === 'object') {
        //     for (var p in value) {
        //         returnValue[p] = this._processFieldProperty(control, p, returnValue[p])
        //     }
        // }
        return returnValue;
    }
}

export default ExoFormDataBinding;
