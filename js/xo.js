import 'regenerator-runtime/runtime'; // included for babel build 
import ExoFormFactory from '../src/exo/core/ExoFormFactory';
import RouteModule from '../src/pwa/RouteModule';
import ExoBaseControls from '../src/exo/controls/base/ExoBaseControls';
import DOM from '../src/pwa/DOM';
import PWA from '../src/pwa/PWA';
import Core from '../src/pwa/Core';
import MsIdentity from '../src/pwa/MsIdentity';
import ExoEntityManager from '../src/exo/databinding/ExoEntityManager';

/**
 * ExoForm shortcut object
 */
class Form {
    get factory() { return ExoFormFactory }
    get entity() { return ExoEntityManager }
    get fields() {
        return {
            base: ExoBaseControls
        }
    }
    get run() { return ExoFormFactory.run }

    /**
     * Bind all datamodel changes to a function
     * @param {Function} f - the function to call
     * @param {*} verbose - Verbose mode
     */
    bind(f, verbose) {
        if (typeof (f) !== "function") {
            throw TypeError("Must pass a function");
        }
        xo.on("new-form", e => {
            e.detail.exoForm.on("schemaLoaded", ev => {
                f({
                    state: "ready",
                    exo: e.detail.exoForm,
                    instances: ev.detail.host.dataBinding.model.instance
                })

                e.detail.exoForm.on("dataModelChange", e => {
                    let state = e.detail.state !== "ready" ? "change" : "modelready";
                    if (state === "modelready") {
                        e.detail.log = "Model ready";
                    }
                    if (verbose) {
                        console.log("form.bind", e.detail.state + " - " + (e.detail.log || "none"))
                    }
                    f({
                        exo: e.detail.host.exo, ...e.detail, state: state
                    })

                })
            })
        })
    }

    /**
     * Gets an ExoForm instance from an HTML element
     * @param {HtmlElement} elm 
     * @returns {ExoForm}
     */
    from(elm) {
        if (!elm)
            return;

        let f = ExoFormFactory.getFieldFromElement(elm);
        if (f && f._control)
            return f._control.context.exo;
        else {
            let cnt = elm.closest(".exf-container");
            if (cnt) {
                return xo.form.from(cnt.querySelector(".exf-page"));
            }
        }
    }

    /**
     * Assign a given ExoForm model instance to a variable 
     * @param {String} formId 
     * @param {String} instanceName 
     */
    data(formId, instanceName, f) {

        xo.on("new-form", e => {
            if (e.detail.exoForm.id === formId) {
                e.detail.exoForm.on("schemaLoaded", ev => {
                    let inst = ev.detail.host.dataBinding.model.instance;
                    if (inst[instanceName]) {
                        f(inst[instanceName])
                    }
                })
            }
        });

    }
}

/**
 * Root XO object. Shortcut to most of XO-JS functionality
 */
class XO {
    constructor() {
        this._form = new Form();
        this.events = new Core.Events(this);
    }
    get core() { return Core }
    get dom() { return DOM }
    get pwa() { return PWA }
    get route() { return RouteModule }
    get form() { return this._form }

    identity = {
        msal: MsIdentity
    }
}
const xo = new XO();

window.xo = xo;
export default xo;

