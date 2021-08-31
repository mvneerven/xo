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
                        { value: "false", name: "Off" },
                        { value: "true", name: "On" }
                    ]
                }
            },
            {
                type: "boolean",
                name: "advancedUi",
                title: "Advanced UI",
                description: "Switching on Advanced UI gives experienced ExoForm developers access to advanced features like datamodel state change monitoring, live CSS changes and JS hooks",
                ui: {
                    type: "radiobuttonlist",
                    view: "tiles",
                    items: [
                        { value: false, name: "Off" },
                        { value: true, name: "On" }
                    ]
                }
            }
        );
    }

    constructor() {
        super(...arguments);

        pwa.settings.add(this.settings)
            .on("read", e => {
                let data = {
                    darkmode: pwa.UI.theme === "dark" ? "true" : "false",
                    pagesize: pwa.UI.pagesize || 8,
                    advancedUi: localStorage.advancedUi
                }

                e.detail.instance.data = data;
            })
            .on("write", e => {
                let settings = e.detail.instance.data;
                pwa.UI.theme = settings.darkmode === "true" ? "dark" : "light";
                pwa.UI.pagesize = settings.pagesize;
                localStorage.advancedUi = settings.advancedUi
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