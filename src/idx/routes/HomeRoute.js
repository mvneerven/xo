const DOM = window.xo.dom;
const Core = window.xo.core;

class HomeRoute extends xo.route {
    title = "XO-JS - eXtra Ordinary JavaScript";
    menuTitle = "Home";
    menuIcon = "ti-home";

    get settings() {
        return pwa.settings.createGroup("User Interface",
            {
                type: "boolean",
                name: "darkmode",
                title: "Dark Mode",
                ui: {
                    type: "radiobuttonlist",
                    view: "tiles",
                    items: [
                        { value: true, name: "On" },
                        { value: false, name: "Off" }
                    ]
                }
            });
    }

    constructor(){
        super(...arguments);

        pwa.settings.add(this.settings)
            .on("read", e => {
                let data = {
                    darkmode: pwa.UI.theme === "dark",
                    pagesize: pwa.UI.pagesize || 8
                }
                e.detail.instance.data = data;
            })
            .on("write", e => {
                let settings = e.detail.instance.data;
                pwa.UI.theme = settings.darkmode ? "dark" : "light";
                pwa.UI.pagesize = settings.pagesize;
            })

    }


    init() {
        this.app.on("pwa.unload", e => {
            //e.preventDefault();
        })
    }

    async render() {
        this.app.UI.areas.main.add(document.getElementById("summary").outerHTML);

        this.app.UI.areas.panel.add(document.getElementById("features").outerHTML);
    }
}

export default HomeRoute;