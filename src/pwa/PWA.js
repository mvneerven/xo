import Core from './Core';
import Router from './Router';
import RouteModule from './RouteModule';
import PWA_UI from './PWA_UI';
import PWA_EventHub from './PWA_EventHub';
import PWA_RESTService from './PWA_RESTService';

class PWA {
    static RouteModule = RouteModule;
    static Router = Router;
    
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
        Core.addEvents(this); // add simple event system

        document.querySelector("html").classList.add("pwa-signin-pending");

        this.config = { ...this.defaults, ...(options || {}) };
        this.config.baseUrl = document.location.origin;

        this.config.environment = ["localhost", "127.0.0.1"].includes(document.location.hostname) ? "debug" : "prod";

        console.debug("Checking for serviceWorker in config: serviceWorker.src");
        if (_.config.serviceWorker.src) {
            _._registerWorker(_.config.serviceWorker)
        }

        console.debug("PWA Config", this.config);
        
        this.restService = new PWA_RESTService(this);

        this.eventHub = new PWA_EventHub(this);
        
        this.eventHub.init().then(()=>{

            this.asyncInit().then(() => {
                this.UI = new PWA_UI(this);
    
                _.init();
                _.execute()
            });
                
        })
       
        
        let cl = document.querySelector("html").classList;
        this.forceTheme = cl.contains("theme-dark") ? "dark" : cl.contains("theme-light") ? "light" : undefined;

        cl.add("pwa-env-" + this.config.environment);

    }

    _triggerEvent(eventName, detail, ev) {
        console.debug("Triggering event", eventName, "detail: ", detail)
        if (!ev) {
            ev = new Event(eventName, { "bubbles": false, "cancelable": true });
        }

        ev.detail = {
            app: this,
            ...(detail || {})
        };

        return this.dispatchEvent(ev);
    }

    on(eventName, func) {
        console.debug("PWA: listening to event", {name: eventName, f: func});
        this.addEventListener(eventName, func);
        return this;
    }

    _registerWorker(serviceWorker) {
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

                if (!this._triggerEvent("pwa.route", {
                    module: mod,
                    path: path
                })) {
                    return;
                }

                mod.execute(path);
            },
            ready: () => {
                console.debug("PWA Router Ready");
                _.routerReady()
            }
        })

    }

    rest(endpoint, options) {
        return this.restService.send(endpoint, options);
    }

    get signedIn() {
        return window.account != null;
    }

    getToken() { // to be subclassed
        return Promise.resolve();
    }
    
    setupUI() { } // to be subclassed
    
    routerReady() { } // to be subclassed
}

export default PWA;