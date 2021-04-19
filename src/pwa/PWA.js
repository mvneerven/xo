import DOM from './DOM';
import Core from './Core';

class ServiceWorkerBase {
    constructor() {
        // TODO
    }
}

//#region Router
class Router {
    static _ev_pfx = "pwa-ev-";

    static events = {
        route: Router._ev_pfx + "route"
    }

    modules = [];

    constructor(app, routes, settings) {
        const _ = this;
        Core.addEvents(this); // add simple event system
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

    _triggerEvent(eventName, detail, ev) {
        console.debug("Triggering event", eventName, "detail: ", detail)
        if (!ev) {
            ev = new Event(eventName, { "bubbles": false, "cancelable": false });
        }

        ev.detail = {
            router: this,
            ...(detail || {})
        };

        return this.dispatchEvent(ev);
    }

    on(eventName, func) {
        console.debug("Listening to event", eventName, func);
        this.addEventListener(eventName, func);
        return this;
    }

    static changeHash(anchor) {
        history.replaceState(null, null, document.location.pathname + '#' + anchor);
    };

    setupHashListener(callback) {
        this.routeCallback = (m, p) => {
            this._triggerEvent(Router.events.route, {
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
                _.loadES6Module(route, _.app, route, r).then(o => {
                    resolve(o);
                })
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
                return await import(src);
            }
            catch (ex) {
                throw "Could not load " + src + ": " + ex;
            }
        };
        return imp(src).then(x => {
            let h = x.default;
            return new h(...args);
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
            if (_.config.areas.menu) {
                let menu = e.target.closest(_.config.areas.menu);
                if (menu) {
                    if (e.target.closest("li")) {
                        menu.classList.add("clicked");
                    }
                    else {
                        menu.classList.remove("clicked");
                    }
                }
            }
        });

        return menu;
    }
}

export class RouteModule {

    title = "Module";

    menuIcon = "ti-test";

    constructor(app, route, path) {
        this.route = route
        this.app = app;
        this.path = path;

        if (!app)
            throw "RouteModule constructor parameter 'app' not defined";
        if (!app.config)
            throw "app.config not defined";


    }

    _unload() {
        document.head.querySelectorAll("[data-pwa]").forEach(e => {
            e.remove();
        })
        this.unload();
    }

    unload() {
        // to be implemented by subclasser
    }

    // subclass this if you need async stuff to be initialized
    async asyncInit() {
        return Promise.resolve();
    }

    execute() {
        const _ = this;

        _.asyncInit().then(() => {
            _._init();
            _.app.UI.areas.title.set(_.title);
            _.render(...arguments);
        })
    }

    render() { }

    _init() {
        const _ = this;
        for (var a in _.app.UI.areas) {
            _.app.UI.areas[a].empty = false;
        }
    }
}

//#endregion

//#region Area

class Area {

    constructor(name, element) {
        this.name = name;
        const _ = this;

        _.element = element;

        _.checkPinnable()
    }

    add(e) {
        if (!e)
            return;

        try {
            if (typeof (e) == "string") {
                if (e.indexOf('<') === -1)
                    e = DOM.parseHTML('<span>' + e + '</span>');
                else
                    e = DOM.parseHTML(e)
            }

            this.element.appendChild(e)

        }
        catch (ex) {
            throw "Area.add failed for " + e + ". " + ex.toString();
        }

    }

    set(s) {
        this.element.innerHTML = s;
    }

    clear() {
        this.set("");
    }

    checkPinnable() {
        const _ = this;
        if (_.element.classList.contains("pwa-pinnable")) {
            // check hover over pin icon (cannot be done using CSS, since it's a pseudo-element - :before )
            _.element.addEventListener("mouseover", e => {
                let overPin = (e.offsetX > _.element.offsetWidth - 70) && (e.offsetY < 70);
                if (overPin) {
                    _.pinActive = true;
                    _.element.classList.add("pin-active");
                }
                else if (_.pinActive) {
                    _.pinActive = false;
                    _.element.classList.remove("pin-active");
                }
            });

            _.element.addEventListener("click", e => {
                if (_.pinActive) {
                    _.pinned = !_.pinned
                }
            });
        }
    }

    get pinned() {
        return this.element.classList.contains("pinned")
    }

    set pinned(value) {
        this.element.classList[value ? "add" : "remove"]("pinned");
        if (!value) {
            this.element.classList.remove("pin-active");
        }
    }

    // bosy state
    set busy(value) {
        if (value) {
            this.element.classList.add("pwa-loading")
        }
        else {
            this.element.classList.remove("pwa-loading")
        }
    }

    get busy() {
        this.element.classList.add("pwa-loading")
    }

    // empty state
    set empty(value) {
        clearTimeout(this.rtimer);
        clearTimeout(this.atimer);
        if (value) {
            this.element.classList.remove("remove");

            this.rtimer = setTimeout(() => {
                this.element.classList.remove("add");
            }, 100);

            this.element.classList.add("pwa-empty-state", "add");
        }
        else {
            this.element.classList.add("remove");
            this.rtimer = setTimeout(() => {
                this.element.classList.remove("pwa-empty-state", "remove");
            }, 500);
        }
    }

    get empty() {
        return this.element.classList.includes("pwa-empty-state");
    }
}

//#endregion

class PWA {

    static RouteModule = RouteModule;
    static Router = Router;
    static ServiceWorkerBase = ServiceWorkerBase;

    defaults = {
        UI: {
            allowUserSelection: false
        },
        serviceWorker: {
            src: null
        }
    }

    constructor(options) {
        const _ = this;

        document.querySelector("html").classList.add("pwa-signin-pending");

        this.config = { ...this.defaults, ...(options || {}) };
        this.config.baseUrl = document.location.origin;

        this.config.environment = ["localhost", "127.0.0.1"].includes(document.location.hostname) ? "debug" : "prod";

        console.debug("Checking for serviceWorker in config: serviceWorker.src");
        if (_.config.serviceWorker.src) {
            _.registerWorker(_.config.serviceWorker)
        }

        console.debug("PWA Config", this.config);

        this.asyncInit().then(() => {
            this.UI = new UI(this);

            _.init();
            _.execute()
        });

        let cl = document.querySelector("html").classList;
        this.forceTheme = cl.contains("theme-dark") ? "dark" : cl.contains("theme-light") ? "light" : undefined;

        cl.add("pwa-env-" + this.config.environment);

    }

    registerWorker(serviceWorker) {
        console.debug("Register PWA ServiceWoker..." + serviceWorker.src);

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register(serviceWorker.src)
                .then(function (registration) {

                    console.debug('Registration successful, scope is:', registration.scope);

                    /*
                    registration.sync.register('myFirstSync');
                    
                    _.addEventListener('sync', function(event) {
                        if (event.tag == 'myFirstSync') {
                            event.waitUntil(doSomeStuff());
                        }
                    });
                    */

                })
                .catch(function (error) {
                    console.log('Service worker registration failed, error:', error);
                });
        }

    }

    init() {
        // to subclass
    }

    asyncInit() {
        return Promise.resolve();
    }

    execute(async) {
        const _ = this;

        this.setupUI()

        _.router = new Router(_, this.config.routes, {
            onRoute: (mod, path) => {
                console.debug("PWA Executes Route", mod, path);
                mod.execute(path);
            },
            ready: () => {
                console.debug("PWA Router Ready");
                _.routerReady()
            }
        })

    }

    rest(endpoint, options) {
        const _ = this;
        const headers = new Headers();
        options = options || {};

        endpoint = new URL(endpoint, this.config.baseUrl);

        const fetchOptions = {
            method: "GET",
            ...options
        };

        let tokenAcquirer = (scope) => {
            return Promise.resolve();
        }
        if (!options.isAnonymous) {
            tokenAcquirer = () => {
                return _.getToken.apply(_)
            };
        }

        return tokenAcquirer().then(r => {
            if (r && r.accessToken) {
                headers.append("Authorization", `Bearer ` + r.accessToken);
            }
            else {
                console.warn("No JWT Token provided. Continuing anonymously");
            }

            if (options.headers) {
                for (var h in options.headers) {
                    headers.append(h, options.headers[h]);
                }
            }

            fetchOptions.headers = headers
            return fetch(endpoint, fetchOptions).then(x => x.json())
        })
    }

    get signedIn() {
        return window.account != null;
    }

    getToken() { // for subclassing
        return Promise.resolve();
    }

    // to be subclassed
    setupUI() { }

    // to be subclassed
    routerReady() { }
}

class Notifications {
    constructor(ui) {
        this.UI = ui;
    }

    add(msg, options) {
        options = options || { type: "info" };

        if (!msg)
            msg = "An unknown error has occurred";
        else if (typeof (msg) !== "string")
            msg = msg.toString();

        const tpl = /*html*/`
            <div class="pwa-notif pwa-{{type}}">
                <div class="pwa-cnt">
                    <span>{{msg}}</span>
                    <div class="pwa-notif-btns"></div>
                    <progress value="100" max="100"></progress>
                </div>
            </div>
        `;

        let notif = DOM.parseHTML(
            DOM.format(tpl, {
                type: options.type,
                msg: msg
            })
        );

        if (options.buttons) {
            let notifBtn = notif.querySelector(".pwa-notif-btns");
            for (var b in options.buttons) {
                let btn = options.buttons[b]

                let btnHtml = DOM.parseHTML(DOM.format(`<button class="btn">{{caption}}</button>`, btn));
                notifBtn.appendChild(btnHtml)
                btnHtml.addEventListener("click", e => {
                    e.stopPropagation();
                    btn.click(e)
                });

            }
        }

        notif.addEventListener("click", () => {
            notif.remove();
        })

        const timeout = options.timeout || (2000 + (msg.split(' ').length * 200));

        document.body.appendChild(notif);

        let prog = notif.querySelector("progress");
        prog.setAttribute("value", "100");

        var i = 100, countDown;
        countDown = setInterval(() => {
            i--
            prog.setAttribute("value", i.toString());
            if (i <= 0)
                clearInterval(countDown);

        }, timeout / 100);


        setTimeout(() => {
            notif.classList.add("move-out");

            setTimeout(() => {
                notif.remove();
            }, 2000);

        }, timeout);
    }
}

class UI {

    _dirtyMessage = 'If you continue your changes will not be saved.';
    _dirty = false;

    areas = {};

    notifications = new Notifications(this);

    constructor(pwa) {
        const _ = this;
        this.pwa = pwa;

        this.html = document.querySelector("html");

        if (this.pwa.id) {
            this.html.setAttribute("id", this.pwa.id);
        }

        this.pwa.config.UI.user = {
            prefersDarkScheme: window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)").matches : false,
            currentTheme: localStorage.getItem("theme") || "light"
        }

        if (!this.pwa.config.UI.allowUserSelection) {
            this.html.classList.add("no-user-select");
        }

        if ('ontouchstart' in window) {
            this.html.classList.add('pwa-touch');
        }

        if (this.forceTheme) {
            this.theme = this.forceTheme;
        }
        else {
            if (this.pwa.config.UI.user.currentTheme === undefined) {
                this.theme = this.pwa.config.UI.user.prefersDarkScheme ? "dark" : "light";
            }
            else {
                this.theme = this.pwa.config.UI.user.currentTheme;
            }
        }

        window.addEventListener("beforeunload", function (event) {
            // Cancel the event as stated by the standard.
            event.preventDefault();
            // Chrome requires returnValue to be set.

            if (!_.dirty)
                delete event['returnValue'];
            else {
                event.returnValue = '';
            }
        });
        this._setAreas();
    }

    set dirty(value) {
        this._dirty = true;
    }

    get dirty() {
        return this._dirty;
    }

    _setAreas() {
        let ar = document.querySelectorAll("[data-pwa-area]");

        if (!ar.length)
            throw "No PWA areas defined";

        ar.forEach(element => {
            var areaName = element.getAttribute("data-pwa-area")
            this.areas[areaName] = new Area(areaName, element);
        });
    }

    get theme() {
        return this._theme || "light"
    }

    set theme(value) {
        this._theme = value;

        let schemes = document.querySelector("head > meta[name='color-scheme']");
        if (schemes) {
            schemes.setAttribute("content", value);
            localStorage.setItem("theme", value);
            document.querySelector("html").classList.remove("theme-dark", "theme-light");
            document.querySelector("html").classList.add("theme-" + value);
        }
        else {
            console.warn("Theming depends on meta[name='color-scheme']");
        }
    }

    addStyleSheet(url) {
        DOM.addStyleSheet(url, {
            "data-pwa": this.pwa.router.current.path
        });

    }

    async showDialog(options) {
        let ctx = await window.xo.form.factory.build();
        let frm = ctx.createForm();
        frm.renderSingleControl({
            ...options || {},
            type: "dialog"
        }).then(r => {
            var f = window.xo.form.factory.getFieldFromElement(r);
            // f._control.hide = e => {

            //     options.click(e)
            // }

            f._control.show();
        });
    }

}

export default PWA;