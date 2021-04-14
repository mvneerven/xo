export default xo;
declare namespace xo {
    export { Core as core };
    export { DOM as dom };
    export { PWA as pwa };
    export { ExoRouteModule as route };
    export namespace form {
        export { ExoFormFactory as factory };
        export namespace fields {
            export { ExoBaseControls as base };
        }
        export { ExoWizardRouteModule as wizard };
    }
    export namespace identity {
        export { MsIdentity as msal };
    }
}
import Core from "../pwa/Core";
import DOM from "../pwa/DOM";
import PWA from "../pwa/PWA";
import ExoRouteModule from "./ExoRouteModule";
import ExoFormFactory from "./ExoFormFactory";
import ExoBaseControls from "./ExoBaseControls";
import ExoWizardRouteModule from "./ExoWizardRouteModule";
import MsIdentity from "../pwa/MsIdentity";
