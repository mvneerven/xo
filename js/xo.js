import 'regenerator-runtime/runtime'; // included for babel build 
import ExoFormFactory from '../src/exo/core/ExoFormFactory';
import RouteModule from '../src/pwa/RouteModule';
import ExoBaseControls from '../src/exo/controls/base/ExoBaseControls';
import DOM from '../src/pwa/DOM';
import PWA from '../src/pwa/PWA';
import Core from '../src/pwa/Core';
import MsIdentity from '../src/pwa/MsIdentity';
import ExoEntityManager from '../src/exo/databinding/ExoEntityManager';

class Form {
    get factory() { return ExoFormFactory }
    get entity() { return ExoEntityManager }
    get fields() {
        return {
            base: ExoBaseControls
        }
    }
    get run() { return ExoFormFactory.run }

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

                        exo: e.detail.host.exo,
                        ...e.detail,
                        state: state
                    })

                })
            })
        })
    }
}

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

