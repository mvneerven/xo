import Core from './Core';
import RouteModule from './RouteModule';
import Router from './Router';

class PWA_Router {
    modules = [];

    constructor(app, routes, settings) {
        const me = this;
        this.events = new Core.Events(this); // add simple event system
        this.app = app;
        this.routes = routes;

        console.debug("Router", "Loading Route modules");
        this.loadModules().then(() => {
            console.debug("Router", "Loaded Route modules", this.modules);
            let ev = new Event("hashchange");
            window.dispatchEvent(ev);

        }).then(() => {
            console.debug("Router", "Router Ready");

            this.spaRouter = new Router({
                type: app.config.router || "hash",
                routes: this.routes
            }).listen().on("route", e => {
                let fullUrl = e.detail.url.toString();
                let ix = fullUrl.indexOf(e.detail.path);
                let path = fullUrl.substr(ix + e.detail.path.length);
                let m = this.findByRoute(e.detail.path);
                m.id = e.detail.path;
                if (m && m.module) {
                    this._route = m.id;
                    let html = document.querySelector("html");
                    html.setAttribute("data-pwa-route", m.id);

                    if (me.current) {
                        this.app.UI.clearAffectedAreas(); // clear areas with data-reset="route" attrib
                        me.current.module._unload();
                    }
                    me.current = m;
                    this.events.trigger("route", {
                        id: m.id,
                        module: m,
                        path: path
                    });
                    settings.onRoute(m.module, path)
                }
            })
            settings.ready();
        })
    }

    set route(routePath) {
        this.spaRouter.setRoute(routePath)
    }

    get route() {
        return this._route;
    }

    findByRoute(route) {
        return this.modules.find(x => { return x.path === route });
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
                throw TypeError("Malformed route: " + r);

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
            throw TypeError("Router misconfiguration: no home (/) route found");
        }

        let prefix = this.app.config.router === "hash" ? "#" : "";
        return Promise.all(promises).then(e => {
            e.forEach(o => {
                this.modules.push({
                    route: o.route,
                    url: prefix + o.path,
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
                throw TypeError(`Could not load ${src}: ${ex.toString()}`);
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

export default PWA_Router;