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
        wizard: ExoWizardRouteModule,
        run: async (value, options) => {
            options = options || {};
            options.context = options.context || await ExoFormFactory.build()
            let x = options.context.createForm();
            if(options.on){
                for(var o in options.on){
                    x.on(o, options.on[o])
                }
            }
            await x.load(value);
            await x.renderForm();
            return x;
        }
    },
    identity: {
        msal: MsIdentity
    }
    
};

window.xo = xo;

export default xo;