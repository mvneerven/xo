export default Router;
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
