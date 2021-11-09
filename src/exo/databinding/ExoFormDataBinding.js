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
        //instance: {} //,
        //bindings: {}
    };

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
            //this._signalDataBindingError(ex);
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

            throw TypeError(`Could not set ${path}: ${ex.message}`);// to ${value}: ${ex.message}`)
        }

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

        const equals = (x,y) => {
            if(typeof(x)==="object")
                return Core.objectEquals(x,y)
            return x === y;
        }
        const proxify = (instanceName, object, change, subPath) => {

            if (object?.__proxy__) {
                return object;
            }           

            const pxy = new Proxy(object, {
                get: function (object, name) {
                    if (name === '__proxy__') {
                        return true;
                    }
                    return object[name];
                },
                set: function (object, name, value, receiver) {
                    var old = object[name];
                    if (value ){
                        if( typeof value === 'object') {
                            // new object needs to be proxified as well
                            value = proxify(instanceName, value, change, subPath + "/" + name);
                        }
                    }
                    
                    if(old === undefined && Array.isArray(receiver)){
                        object.push(value);
                        change(object, null, old, value, subPath);
                        return true;
                    }
                    else{
                        object[name] = value;
                    }
                    
                    if (!equals(old, value)) {
                        change(object, name, old, value, subPath);
                    }
                    return true;
                }
            });
            for (var prop in object) {
                if (object.hasOwnProperty(prop) && object[prop]){
                    if(typeof object[prop] === 'object') { // proxify all child objects
                        object[prop] = proxify(instanceName, object[prop], change, subPath + "/" + prop);
                    }
                }
            }
            return pxy;
        }

        return proxify(instanceName, obj, (object, property, oldValue, newValue, subPath) => {


            const path = property ?  `#/${instanceName}${subPath}/${property}` : `#/${instanceName}${subPath}`;
            console.log("proxify path: " , path)
            
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
        else if (typeof (value) === 'object') {
            for (var p in value) {
                returnValue[p] = this._processFieldProperty(control, p, returnValue[p])
            }
        }
        return returnValue;
    }
}

export default ExoFormDataBinding;
