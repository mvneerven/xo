import PWA from '../pwa/PWA';
import ExoFormFactory from './ExoFormFactory';

class ExoRouteModule extends PWA.RouteModule{

    // subclass PWA.RouteModule for modules to
    // get an ExoFormContext to create ExoForms
    async asyncInit(){
        this.exoContext = await ExoFormFactory.build();
    }

}

export default ExoRouteModule;