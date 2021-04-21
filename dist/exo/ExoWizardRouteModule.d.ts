export default ExoWizardRouteModule;
declare class ExoWizardRouteModule extends ExoRouteModule {
    formLoaded(): void;
    wizardRendered(): void;
    post(obj: any): void;
    event(e: any): void;
    engine: any;
}
import ExoRouteModule from "./ExoRouteModule";
