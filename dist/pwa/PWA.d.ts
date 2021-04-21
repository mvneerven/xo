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
    signalR: Promise<void>;
    UI: PWA_UI;
    forceTheme: string;
    triggerEvent(eventName: any, detail: any, ev: any): any;
    on(eventName: any, func: any): PWA;
    registerWorker(serviceWorker: any): void;
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
import PWA_UI from "./PWA_UI";
import Router from "./Router";
import RouteModule from "./RouteModule";
