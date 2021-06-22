import 'regenerator-runtime/runtime'; // included for babel build 
import routes from "../src/idx/routes";
import GridColumnResizer from '../src/idx/modules/GridColumnResizer';

class ExoFormStudio extends window.xo.pwa {
    routerReady() {
        this.router.generateMenu(this.UI.areas.menu);


        this.router.on(window.xo.pwa.Router.events.route, e =>{
           document.title = "ExoForm - " + e.detail.module.title 
        })

        this.omniBox = new xo.pwa.OmniBox({
            useRoutes: r => {
                return true
            },
            placeholder: "The start of everything...",
            tooltip: "Navigate through this app by clicking & typing here..",

            categories: {
                Google: {
                    sortIndex: 500,
                    trigger: options => { return options.results.length === 0 && options.search.length >= 2 },
                    text: "Search on Google for '%search%'",
                    getItems: options => {
                        return [{
                            text: "Search on Google for '%search%'"
                        }]
                    },
                    icon: "ti-search",
                    action: options => {
                        options.url = `https://www.google.com/search?q=${options.search}`;
                    },
                    newTab: true
                },

                Images: {
                    sortIndex: 600,
                    trigger: options => { return options.search.length >= 2 },
                    getItems: options => {
                        return [{
                            text: "Search images on Pexels for '%search%'"
                        }]
                    },
                    action: options => {
                        options.url = `https://www.pexels.com/search/${options.search}`;
                    },
                    newTab: true,
                    text: "Search for '%search%' images",
                    icon: "ti-image"
                },

                Products: {
                    sortIndex: 100,
                    trigger: options => { return options.search.length >= 2 },
                    getItems: options => {
                        return [{
                            text: "Search products with term/tag '%search%'"
                        }]
                    },
                    text: "Search for '%search%' products",
                    icon: "ti-package",
                    action: options => {
                        document.location.hash = `/products/${options.search}`;
                    }
                }
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

