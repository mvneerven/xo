import Core from './Core';
import Router from './Router';
import RouteModule from './RouteModule';
import PWA_UI from './PWA_UI';
import PWA_EventHub from './PWA_EventHub';
import PWA_RESTService from './PWA_RESTService';
import PWA_OmniBox from './PWA_OmniBox';
import PWA_Settings from './PWA_Settings';
import PWA_SettingsGroup from './PWA_SettingsGroup';
import ULTabStrip from './ULTabStrip';

/**
 * Progressive Web App container 
 */
class PWA {
    static RouteModule = RouteModule;
    static Router = Router;
    static OmniBox = PWA_OmniBox;
    static TabStrip = ULTabStrip;

    defaults = {
        UI: {
            allowUserSelection: false
        },
        serviceWorker: {
            src: null
        }
    }

    /**
     * Constructor
     * @param {Object} options - sets up the PWA 
     */
    constructor(options) {
        window.pwa = this;

        this._settings = new PWA_Settings();

        this.events = new Core.Events(this);

        this.config = { ...this.defaults, ...(options || {}) };
        this.config.baseUrl = document.location.origin;

        this.config.environment = ["localhost", "127.0.0.1"].includes(document.location.hostname) ? "debug" : "prod";

        console.debug("Checking for serviceWorker in config: serviceWorker.src");
        if (this.config.serviceWorker.src) {
            this._registerWorker(this.config.serviceWorker)
        }

        console.debug("PWA Config", this.config);

        this._restService = new PWA_RESTService(this);

        this.eventHub = new PWA_EventHub(this);

        this.eventHub.init();

        this.asyncInit().then(() => {
            this._UI = new PWA_UI(this);
            this.init();
            let cl = document.querySelector("html").classList;
            this.UI.forceTheme = cl.contains("theme-dark") ? "dark" : cl.contains("theme-light") ? "light" : undefined;
            cl.add("pwa-env-" + this.config.environment);
            this.execute()
        });
    

        
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
                    console.error('Service worker registration failed, error:', error);
                });
        }

    }

    init() {
        // to subclass
    }

    /**
     * Returns the REST service (using a fetch implementation)
     */
    get restService(){
        return this._restService;
    }

    /**
     * Returns the UI instance for this PWA
     */
    get UI(){
        return this._UI;
    }

    /**
     * Called to allow the inherited class to initialize async
     * @returns Promise
     */
    asyncInit() {
        return Promise.resolve();
    }

    execute(async) {
        this.setupUI()

        this._router = new Router(this, this.config.routes, {
            onRoute: (mod, path) => {
                console.debug("PWA Executes Route", mod, path);

                if (!this.events.trigger("pwa.route", {
                    module: mod,
                    path: path
                })) {
                    return;
                }

                mod.execute(path);
            },
            ready: () => {
                console.debug("PWA Router Ready");
                this.routerReady()
            }
        })

    }

    /**
     * Returns the router instance created for the PWA.
     */
    get router() {
        return this._router;
    }

    rest(endpoint, options) {
        return this.restService.send(endpoint, options);
    }

    get signedIn() {
        return window.account != null;
    }

    /**
     * Returns the JWT token to use in REST (if implemented in inherited class)
     * @returns JWT token wrapped in promise 
     */
    getToken() { // to be subclassed
        return Promise.resolve();
    }

    setupUI() { } // to be subclassed

    /**
     * Called when all routes have been set up (asynchronously)
     */
    routerReady() { } // to be subclassed

    get settings(){
        return this._settings;
    }
}

export default PWA;