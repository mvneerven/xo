import 'regenerator-runtime/runtime'; // included for babel build 
import routes from "../src/idx/routes";
import GridColumnResizer from '../src/idx/modules/GridColumnResizer';

class ExoFormStudio extends xo.pwa {

    constructor(){
        super(...arguments);

        
    }

    routerReady() {

        document.title = `XO-JS ${xo.version}`;

        this.router.generateMenu(this.UI.areas.menu);

        this.router.on("route", e =>{
           document.title = `XO-JS ${xo.version} - ${e.detail.module.title}` 
        })

        this.omniBox = new xo.pwa.OmniBox({
            useRoutes: r => {
                return true
            },
            placeholder: "Find anything in XO-JS...",
            tooltip: "Navigate through this app by clicking & typing here..",

            categories: {
                
            }
        });

        this.omniBox.render().then(elm => {
            this.UI.areas.header.add(elm)
        })
      
    }
}

fetch("/data/config.json").then(x => x.json()).then(options => {
    options.routes = routes;
    
    new ExoFormStudio(options);


    document.querySelectorAll("[data-resize-grid]").forEach((elm) => {
        new GridColumnResizer(elm);
    });
});

