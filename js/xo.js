/*!
 * XO-JS - Vanilla JavaScript Web Form generation and SPA/PWA helpers.
 * (c) 2021 Marc van Neerven, MIT License, https://cto-as-a-service.nl 
*/

import 'regenerator-runtime/runtime'; // included for babel build 
import ExoFormFactory from '../src/exo/core/ExoFormFactory';
import RouteModule from '../src/pwa/RouteModule';
import ExoBaseControls from '../src/exo/controls/base';
import ExoExtendedControls from '../src/exo/controls/extended';
import DOM from '../src/pwa/DOM';
import PWA from '../src/pwa/PWA';
import Core from '../src/pwa/Core';
import MsIdentity from '../src/pwa/MsIdentity';
import ExoEntityManager from '../src/exo/entity/ExoEntityManager';
import ExoFormSchema from '../src/exo/core/ExoFormSchema';
import { version } from '../package.json';
import ExoSandboxControl from '../src/exo/controls/extended/ExoSandboxControl';

class ControlHelper {

    cElm(htmlElement, master) {
        let elm = htmlElement;
        if(master)
            elm = htmlElement.closest(`[data-exf-master]`) || elm;
        
        elm = elm.closest(`[data-exf]`) ;
        
        return elm || htmlElement;
    }

    get(htmlElement, master) {
        if (document.data?.controlDict) {
            let hex = this.cElm(htmlElement, master).getAttribute("data-exf")
            let ctl = document.data.controlDict[hex];
            return ctl;
        }
    }

    register(htmlElement, control) {
        if (!document.data) {
            const obj = {
                controlDict: {},
                index: 1000
            }
            document.data = obj;//new WeakRef(obj);
        }

        document.data.index++;

        const elm = this.cElm(htmlElement);
        const hex = 'exi' + document.data.index.toString(16)
        elm.setAttribute("data-exf", hex);

        document.data.controlDict[hex] = control;

    }
}

/**
 * XO Form shortcut object
 */
class FormHelper {

    /**
     * Returns the ExoFormFactory class
     */
    get factory() { return ExoFormFactory }

    get entity() { return ExoEntityManager }

    get schema() { return ExoFormSchema }

    get empty() { return { pages: [{ fields: [{ type: "text", caption: "Textbox 1" }] }] } }

    get fields() {
        return {
            base: ExoBaseControls,
            extended: ExoExtendedControls
        }
    }

    get err() {
        return ExoFormFactory.err;
    }

    /**
     * Renders a form
     */
    get run() { return ExoFormFactory.run }

    /**
     * Reads and parses any form schema or URL.
     */
    get read() { return ExoFormFactory.read }

    get sandbox() {
        return ExoSandboxControl
    }

    /**
     * Link up an XO form ton enable dual binding from and to XO form state.
     * @param {*} formId - null to catch all
     * @param {Function} callback to call when the form is ready to link to.
     */
    async link(formId, callback) {
        if (typeof (callback) !== "function")
            throw TypeError("Must provide a callback function");

        this.bind(e => {
            if ((!formId || formId === e.exo.id) && e.state === "ready") {
                callback(e.instances);
            }
        });
    }


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
                        let log = "none";

                        if (state === "change" && !e.detail.change) {
                            log = (e.detail.changeData.log || "none")
                        }

                        console.log("form.bind", e.detail.state + " - " + log)
                    }
                    f({
                        exo: e.detail.host.exo, ...e.detail, state: state
                    })

                })
            })
        })
    }

    /**
     * Gets an XO form instance from an HTML element
     * @param {HtmlElement} elm 
     * @returns {ExoForm}
     */
    from(elm) {
        if (!elm)
            return;

        let el = elm.closest("[data-exf]") || elm.querySelector("[data-exf]");
        if (el?.data?.field)
            return el.data.field._control.context.exo;

    }

    /**
     * Assign a given XO form model instance to a variable.
     * 
     * Usage:
     * 
     * Get access to the instance called 'data':
     *  let data = xo.form.data("my-form", "data", o => data = o);* 
     * If you want access to all instances instead of a named one:
     *  let instances = xo.form.data("my-form", o => instances = o);
     * 
     * @param {String} formId - the id of the XO form instance 
     * @param {String} instanceName - the name of the instance to bind to
     * @param {Function} f - the callback to use when the instance is available
     */
    data(formId, instanceName, f) {
        if (typeof (instanceName) === "function" && f === undefined) {
            f = instanceName;
            instanceName = null;
        }

        xo.on("new-form", e => {
            if (e.detail.exoForm.id === formId) {
                e.detail.exoForm.on("schemaLoaded", ev => {
                    let instances = ev.detail.host.dataBinding.model.instance;
                    f(!instanceName ? instances : instances[instanceName])
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
        this._form = new FormHelper();
        this._control = new ControlHelper();
        this.events = new Core.Events(this);
        const v = version.split(".");
        this._path = `https://xo-js.dev/v${v[0]}.${v[1]}`;
    }
    get core() { return Core }
    get dom() { return DOM }
    get pwa() { return PWA }
    get route() { return RouteModule }
    get form() { return this._form }
    get control() { return this._control }
    get version() { return version }
    get path() { return this._path }

    get isDebug() { return ["localhost", "127.0.0.1"].includes(document.location.hostname); }
    identity = {
        msal: MsIdentity
    }
}
const xo = new XO();
window.xo = xo;
export default xo;

