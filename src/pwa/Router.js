import DOM from './DOM';
import Core from './Core';
import RouteModule from './RouteModule';

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

        console.debug("Loading Route modules");
        this.loadModules().then(() => {
            console.debug("Loaded Route modules", this.modules);
            DOM.trigger(window, 'hashchange');
        }).then(() => {
            console.debug("Router Ready");
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
                    
                    this.routeCallback(m.module, path);

                    this.updateGeneratedMenu(m.module.path);
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

    updateGeneratedMenu(selectedPath) {
        if (this.menu) {
            this.menu.element.querySelectorAll("li").forEach(li => {
                let selected = selectedPath === li.getAttribute("data-route");
                li.classList[selected ? "add" : "remove"]("selected")
            })
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
                this.modules.push({
                    ...o,
                    route: o.route,
                    url: "#" + o.path,
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

    home() {
        this.route = "/";
    }

    generateMenu(menu) {

        const menuTpl = /*html*/`<nav class="main-menu"><ul>{{inner}}</ul></nav>`;
        const menuItemTpl = /*html*/`<li class="{{class}}" data-route="{{path}}" title="{{title}}"><a href="{{url}}"><span class="{{menuIcon}}"></span> <span class="name">{{menuTitle}}</span></a></li>`;
        let ar = [];

        this.modules.forEach(m => {

            if (!m.hidden) {
                let o = { ...m, name: m.module.constructor.name };
                o.menuTitle = o.menuTitle || m.title;
                o.class = m.path === this.route ? "selected": "";
                o.path = m.path;
                let s = DOM.format(menuItemTpl, o);
                ar.push(s);
            }
        });


        let ul = DOM.format(menuTpl, { inner: ar.join('') });

        menu.add(DOM.parseHTML(ul))

        menu.element.addEventListener("click", e => {

            if (e.target.closest("li")) {
                this.app.UI.areas.menu.element.classList.add("clicked");

                if (!this.touchStarted) {
                    setTimeout(() => {
                        this.app.UI.areas.menu.element.classList.remove("clicked");
                        this.touchStarted = false;
                    }, 1500);
                }
            }
        });

        // handle special mobile case to prevent menu from opening 
        // when mouse
        menu.element.addEventListener("touchstart", e => {
            this.touchStarted = true;

            let menu = e.target.closest("[data-pwa-area]");
            if (menu) {
                if (e.target.closest("li")) {
                    menu.classList.add("clicked");
                }
                else {
                    menu.classList.remove("clicked");
                }
            }

        });

        this.menu = menu;

        return menu;
    }
}

export default Router;