import 'regenerator-runtime/runtime'; // included for babel build 
import ExoFormFactory from '../src/exo/core/ExoFormFactory';
import RouteModule from '../src/pwa/RouteModule';
import ExoBaseControls from '../src/exo/controls/base/ExoBaseControls';
import DOM from '../src/pwa/DOM';
import PWA from '../src/pwa/PWA';
import Core from '../src/pwa/Core';
import MsIdentity from '../src/pwa/MsIdentity';
import ExoEntityManager from '../src/exo/databinding/ExoEntityManager';

class F {
    get factory() { return ExoFormFactory }
    get entity() { return ExoEntityManager }
    get fields() {
        return {
            base: ExoBaseControls
        }
    }
    get run() { return ExoFormFactory.run }
}

class XO {
    constructor() {
        this._f = new F();
        this.events = new Core.Events(this);
    }
    get core() { return Core }
    get dom() { return DOM }
    get pwa() { return PWA }
    get route() { return RouteModule }
    get form() { return this._f }

    identity = {
        msal: MsIdentity
    }
}
const xo = new XO();

window.xo = xo;
export default xo;

