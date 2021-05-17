import ExoFormFactory from './ExoFormFactory';
import ExoRouteModule from './ExoRouteModule';
import ExoWizardRouteModule from './ExoWizardRouteModule';
import ExoBaseControls from './ExoBaseControls';
import DOM from '../pwa/DOM';
import PWA from '../pwa/PWA';
import Core from '../pwa/Core';
import MsIdentity from '../pwa/MsIdentity';

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