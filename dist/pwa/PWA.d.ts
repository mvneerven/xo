export class RouteModule {
    constructor(app: any, route: any, path: any);
    title: string;
    menuIcon: string;
    route: any;
    app: any;
    path: any;
    _unload(): void;
    unload(): void;
    asyncInit(): Promise<void>;
    execute(): void;
    render(): void;
    _init(): void;
}
export default PWA;
declare class PWA {
    static RouteModule: typeof RouteModule;
    static Router: typeof Router;
    static ServiceWorkerBase: typeof ServiceWorkerBase;
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
    UI: UI;
    forceTheme: string;
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
declare class UI {
    constructor(pwa: any);
    _dirtyMessage: string;
    _dirty: boolean;
    areas: {};
    notifications: Notifications;
    pwa: any;
    html: HTMLHtmlElement;
    set theme(arg: any);
    get theme(): any;
    set dirty(arg: boolean);
    get dirty(): boolean;
    _setAreas(): void;
    _theme: any;
    addStyleSheet(url: any): void;
    showDialog(options: any): Promise<void>;
}
declare class Router {
    static _ev_pfx: string;
    static events: {
        route: string;
    };
    static changeHash(anchor: any): void;
    constructor(app: any, routes: any, settings: any);
    modules: any[];
    app: any;
    routes: any;
    _triggerEvent(eventName: any, detail: any, ev: any): any;
    on(eventName: any, func: any): Router;
    setupHashListener(callback: any): void;
    routeCallback: (m: any, p: any) => void;
    hashChanged(): void;
    set route(arg: any);
    get route(): any;
    findByRoute(route: any): any;
    findById(id: any): any;
    loadModules(): Promise<void>;
    loadES6Module(src: any, ...args: any[]): Promise<any>;
    home(): void;
    generateMenu(menu: any): any;
    touchStarted: boolean;
}
declare class ServiceWorkerBase {
}
declare class Notifications {
    constructor(ui: any);
    UI: any;
    add(msg: any, options: any): void;
}
