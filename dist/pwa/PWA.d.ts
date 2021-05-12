export default PWA;
declare class PWA {
    static RouteModule: typeof RouteModule;
    static Router: typeof Router;
    constructor(options: any);
    defaults: {
        UI: {
            allowUserSelection: boolean;
        };
        serviceWorker: {
            src: any;
        };
    };
    config: any;
    restService: PWA_RESTService;
    eventHub: PWA_EventHub;
    UI: PWA_UI;
    forceTheme: string;
    _triggerEvent(eventName: any, detail: any, ev: any): any;
    on(eventName: any, func: any): PWA;
    _registerWorker(serviceWorker: any): void;
    init(): void;
    asyncInit(): Promise<void>;
    execute(async: any): void;
    router: Router;
    rest(endpoint: any, options: any): Promise<any>;
    get signedIn(): boolean;
    getToken(): Promise<void>;
    setupUI(): void;
    routerReady(): void;
}
import PWA_RESTService from "./PWA_RESTService";
import PWA_EventHub from "./PWA_EventHub";
import PWA_UI from "./PWA_UI";
import Router from "./Router";
import RouteModule from "./RouteModule";
