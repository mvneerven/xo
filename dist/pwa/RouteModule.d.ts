export default RouteModule;
declare class RouteModule {
    constructor(app: any, route: any, path: any);
    title: string;
    menuIcon: string;
    route: any;
    app: any;
    path: any;
    init(): void;
    _unload(): void;
    unload(): void;
    asyncInit(): Promise<void>;
    execute(): void;
    render(): void;
    _beforeRender(): void;
}
