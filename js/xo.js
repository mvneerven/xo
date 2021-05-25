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
        run: async (value, options) => {
            options = options || {};
            options.context = options.context || await ExoFormFactory.build()
            let type = ExoFormFactory.determineSchemaType(value);
            switch(type){
                case "form":
                    let x = options.context.createForm({
                        ...options
                    });
                    if(options.on){
                        for(var o in options.on){
                            x.on(o, options.on[o])
                        }
                    }
                    await x.load(value);
                    await x.renderForm();
                    return x.container;
                case "field":
                    let frm = options.context.createForm({
                        ...options
                    });
                    return await frm.renderSingleControl(value);
                case "json-schema":
                    throw TypeError("Not implemented");
                default:
                    throw TypeError("Not implemented");
            }
        }
    },
    identity: {
        msal: MsIdentity
    }
    
};

window.xo = xo;

export default xo;