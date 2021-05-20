import 'regenerator-runtime/runtime'; // included for babel build 
import ExoFormFactory from '../src/exo/ExoFormFactory';
import ExoRouteModule from '../src/exo/ExoRouteModule';
import ExoWizardRouteModule from '../src/exo/ExoWizardRouteModule';
import ExoBaseControls from '../src/exo/controls/base/ExoBaseControls';
import DOM from '../src/pwa/DOM';
import PWA from '../src/pwa/PWA';
import Core from '../src/pwa/Core';
import MsIdentity from '../src/pwa/MsIdentity';

const xo = {
    core: Core,
    dom: DOM,
    pwa: PWA,
    route: ExoRouteModule,
    form: {
        factory: ExoFormFactory,
        fields: {
            base: ExoBaseControls
        },        
        wizard: ExoWizardRouteModule
    },
    identity: {
        msal: MsIdentity
    }
};

window.xo = xo;

export default xo;