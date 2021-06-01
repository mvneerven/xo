import DOM from './DOM';
import Core from './Core';
import RouteModule from './RouteModule';

class Router {
    static _ev_pfx = "pwa-ev-";

    static events = {
        route: Router._ev_pfx + "route"
    }

    modules = [];

    constructor(app, routes, settings) {
        const _ = this;
        this.events = new Core.Events(this); // add simple event system
        _.app = app;
        _.routes = routes;

        _.setupHashListener(settings.onRoute)

        console.debug("Loading Route modules");
        _.loadModules().then(() => {
            console.debug("Loaded Route modules", _.modules);
            DOM.trigger(window, 'hashchange');
        }).then(() => {
            console.debug("Router Ready");
            settings.ready();
        })
    }

    // events.trigger(eventName, detail, ev) {
    //     console.debug("Triggering event", eventName, "detail: ", detail)
    //     if (!ev) {
    //         ev = new Event(eventName, { "bubbles": false, "cancelable": false });
    //     }

    //     ev.detail = {
    //         router: this,
    //         ...(detail || {})
    //     };

    //     return this.dispatchEvent(ev);
    // }

    // on(eventName, func) {
    //     console.debug("Listening to event", eventName, func);
    //     this.addEventListener(eventName, func);
    //     return this;
    // }

    static changeHash(anchor) {
        history.replaceState(null, null, document.location.pathname + '#' + anchor);
    };

    setupHashListener(callback) {
        this.routeCallback = (m, p) => {
            this.events.trigger(Router.events.route, {
                module: m,
                path: p
            });
            callback(m, p)
        };
        const _ = this;
        window.addEventListener('hashchange', () => {
            _.hashChanged();
        });
    }

    hashChanged() {
        const _ = this;
        const W = window;
        var h = W.location.hash.substr(1);
        if (h.startsWith("/")) {
            let id = "/" + h.substr(1).split('/')[0];
            let path = h.substr(id.length);
            let route = _.routes[id];
            console.debug(W.location.hash, "RouteModule: ", route);

            if (route) {
                let m = _.findByRoute(route);
                if (m && m.module) {
                    _._route = id;
                    let html = document.querySelector("html");
                    html.classList.forEach(c => {
                        if (c.startsWith("route-")) {
                            html.classList.remove(c);
                        }
                    })
                    document.querySelector("html").classList.add("route-" + m.module.constructor.name);
                    if (_.current) {
                        _.current.module._unload();
                    }
                    _.current = m;
                    _.routeCallback(m.module, path);
                }
            }
            else if (!h.startsWith("dlg-")) {
                _.home();
            }
        }
        else {
            _.home();
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
        const _ = this;
        let promises = [];
        let homeRouteFound = false;
        for (var r in _.routes) {
            if (r === "/")
                homeRouteFound = true;

            let route = _.routes[r];
            if (!r.startsWith('/'))
                throw "Malformed route: " + r;

            promises.push(new Promise((resolve, reject) => {

                if (route.prototype && route.prototype instanceof RouteModule) {
                    let o = new route(_.app, route, r)
                    resolve(o);

                }
                else if (typeof (route) === "string") {
                    _.loadES6Module(route, _.app, route, r).then(o => {
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
                _.modules.push({
                    ...o,
                    route: o.route,
                    url: "#" + o.path,
                    module: o
                });

            });
        });
    }

    loadES6Module(src) {
        const _ = this;

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
        const _ = this;

        const menuTpl = /*html*/`<nav class="main-menu"><ul>{{inner}}</ul></nav>`;
        const menuItemTpl = /*html*/`<li class="{{class}}" data-module="{{name}}" title="{{title}}"><a href="{{url}}"><span class="{{menuIcon}}"></span> <span class="name">{{menuTitle}}</span></a></li>`;
        let ar = [];

        _.modules.forEach(m => {

            if (!m.hidden) {
                let o = { ...m, name: m.module.constructor.name };

                o.menuTitle = o.menuTitle || m.title;
                let s = DOM.format(menuItemTpl, o);
                ar.push(s);
            }
        });


        let ul = DOM.format(menuTpl, { inner: ar.join('') });

        menu.add(DOM.parseHTML(ul))

        menu.element.addEventListener("click", e => {
            const _ = this;
            if (e.target.closest("li")) {
                _.app.UI.areas.menu.element.classList.add("clicked");

                if (!this.touchStarted) {
                    setTimeout(() => {
                        _.app.UI.areas.menu.element.classList.remove("clicked");
                        _.touchStarted = false;
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

        return menu;
    }
}

export default Router;