
/**
 * Module/App that is launched on the configured PWA route
 */
class RouteModule {

    title = "Module";

    menuIcon = "ti-test";

    autoClear = [];

    constructor(app, route, path) {
        this.route = route
        this.app = app;
        this.path = path;

        if (!app)
            throw "RouteModule constructor parameter 'app' not defined";
        if (!app.config)
            throw "app.config not defined";
    }

    init() { } // called just after instantiation. To be subclassed

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

        this.asyncInit().then(() => {
            this.init();

            this._beforeRender();
            if (this.app.UI.areas.title)
                this.app.UI.areas.title.set(this.title);

            this.render(...arguments);
        })
    }

    render() { }

    _beforeRender() {
        const _ = this;
        for (var a in _.app.UI.areas) {
            _.app.UI.areas[a].empty = false;
        }
    }
}

export default RouteModule;