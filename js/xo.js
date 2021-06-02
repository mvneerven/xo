import 'regenerator-runtime/runtime'; // included for babel build 
import ExoFormFactory from '../src/exo/core/ExoFormFactory';
import RouteModule from '../src/pwa/RouteModule';
import ExoBaseControls from '../src/exo/controls/base/ExoBaseControls';
import DOM from '../src/pwa/DOM';
import PWA from '../src/pwa/PWA';
import Core from '../src/pwa/Core';
import MsIdentity from '../src/pwa/MsIdentity';

const xo = {
    core: Core,
    dom: DOM,
    pwa: PWA,
    route: RouteModule,
    form: {
        factory: ExoFormFactory,
        fields: {
            base: ExoBaseControls
        },
        run: ExoFormFactory.run
    },
    identity: {
        msal: MsIdentity
    }

};

window.xo = xo;

export default xo;