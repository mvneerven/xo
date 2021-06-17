import Core from './Core';
import RouteModule from './RouteModule';

/**
 * Hash-based PWA router
 */
class Router {
    static events = {
        route: "route"
    }

    modules = [];

    constructor(app, routes, settings) {

        this.events = new Core.Events(this); // add simple event system
        this.app = app;
        this.routes = routes;

        this.setupHashListener(settings.onRoute)

        console.debug("Router", "Loading Route modules");
        this.loadModules().then(() => {
            console.debug("Router", "Loaded Route modules", this.modules);
            let ev = new Event("hashchange");
            window.dispatchEvent(ev);

        }).then(() => {
            console.debug("Router", "Router Ready");
            settings.ready();
        })
    }

    static changeHash(anchor) {
        history.replaceState(null, null, document.location.pathname + '#' + anchor);
    };

    setupHashListener(callback) {
        this.routeCallback = (m, p) => {

            this.events.trigger(Router.events.route, {
                id: m.id,
                module: m,
                path: p
            });
            callback(m, p)
        };
        window.addEventListener('hashchange', () => {
            this.hashChanged();
        });
    }

    hashChanged() {
        const W = window;
        var h = W.location.hash.substr(1);
        if (h.startsWith("/")) {
            let id = "/" + h.substr(1).split('/')[0];
            let path = h.substr(id.length);
            let route = this.routes[id];
            console.debug(W.location.hash, "RouteModule: ", route);

            if (route) {
                let m = this.findByRoute(route);
                if (m && m.module) {
                    this._route = id;

                    let html = document.querySelector("html");
                    html.setAttribute("data-pwa-route", id);

                    if (this.current) {
                        this.app.UI.clearAffectedAreas(); // clear areas with data-reset="route" attrib
                        this.current.module._unload();
                    }

                    this.current = m;

                    this.events.trigger("route", {
                        module: m.module,
                        path: path
                    });

                    this.routeCallback(m.module, path);
                }
            }
            else if (!h.startsWith("dlg-")) {
                this.home();
            }
        }
        else {
            this.home();
        }

    }

    set route(routePath) {

        if (!routePath.startsWith("/"))
            throw "Invalid route";

        let routeParts = routePath.substring(1).split('/');

        if (this.routes["/" + routeParts[0]]) {
            Router.changeHash(routePath); // update history, prevent endless redirects back to home router
            this.hashChanged();
        }
        else
            throw "Unknown route: " + routePath;
    }

    get route() {
        return this._route;
    }

    findByRoute(route) {
        return this.modules.find(x => { return x.route === route });
    }

    findById(id) {
        return this.modules.find(x => { return x.path === id });
    }

    loadModules() {
        let promises = [];
        let homeRouteFound = false;
        for (var r in this.routes) {
            if (r === "/")
                homeRouteFound = true;

            let route = this.routes[r];
            if (!r.startsWith('/'))
                throw "Malformed route: " + r;

            promises.push(new Promise((resolve, reject) => {

                if (route.prototype && route.prototype instanceof RouteModule) {
                    let o = new route(this.app, route, r)
                    resolve(o);

                }
                else if (typeof (route) === "string") {
                    this.loadES6Module(route, this.app, route, r).then(o => {
                        resolve(o);
                    })
                }
            }));
        }
        if (!homeRouteFound) {
            throw "Router misconfiguration: no home (/) route found";
        }

        return Promise.all(promises).then(e => {
            e.forEach(o => {
                //debugger;
                this.modules.push({
                    //...o,
                    route: o.route,
                    url: "#" + o.path,
                    path: o.path,
                    title: o.title,
                    menuTitle: o.menuTitle,
                    menuIcon: o.menuIcon,
                    class: o.class || "",
                    module: o
                });

            });
        });
    }

    loadES6Module(src) {
        src = new URL(src, this.app.config.baseUrl);

        let args = Array.prototype.slice.call(arguments, 1);
        const imp = async (src) => {
            try {
                return await import(/* webpackMode: "eager" */ src);
            }
            catch (ex) {
                throw "Could not load " + src + ": " + ex;
            }
        };
        return imp(src).then(x => {
            let h = x.default;
            let mod = new h(...args);
            mod.init();
            return mod;
        });
    }

    /**
     * Returns an array of objects representing the router's route modules
     * @param {Function} filter 
     * @returns Array of objects with route module properties
     */
    listModules(filter) {
        let ar = [];

        if (!filter)
            filter = m => { return !m.hidden };

        this.modules.forEach(m => {
            let o = {
                ...m,
                name: m.module.constructor.name,
                menuTitle: m.menuTitle || m.title,
                class: `${m.class || ""} ${m.path === this.route ? "selected" : ""}`
            };
            if (filter(o)) {
                ar.push(o);
            }
        });
        return ar;
    }

    /**
     * Navigates to the home route
     */
    home() {
        this.route = "/";
    }

    /**
     * Generates a menu based on the provided routes and adds it to 
     * @param {Object} pwaArea - the PWA area to use
     * @param {Function} filter - Optional function to filter menu items out
     */
    generateMenu(pwaArea, filter) {
        this.routerMenu = this.app.UI.createMenu(this);
        this.routerMenu.generate(pwaArea, filter);
    }

}

export default Router;