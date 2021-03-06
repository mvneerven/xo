import ExoFormThemes from "../../exo/themes/ExoFormThemes";

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
                    view: "inline",
                    items: ["Off", "On"]
                }
            },
            {
                type: "boolean",
                name: "advancedUi",
                title: "Advanced UI",
                description: "Switching on Advanced UI gives experienced XO form developers access to advanced features like datamodel state change monitoring, live CSS changes and JS hooks",
                ui: {
                    type: "radiobuttonlist",
                    view: "inline",
                    items: ["Off", "On"]

                }
            },

            {
                name: "defTheme",
                type: "string",
                title: "Default theme",
                ui: {
                    type: "dropdown",
                    items: this.getThemes()
                }

            }

        );
    }

    getThemes() {
        return Object.keys(ExoFormThemes.types).map(i => {
            return {
                name: xo.core.toWords(i),
                value: i
            }
        })
    }

    constructor() {
        super(...arguments);

        pwa.settings.add(this.settings)
            .on("read", e => {
                let data = {
                    darkmode: ["dark", "On"].includes(pwa.UI.theme) ? "On" : "Off",
                    pagesize: pwa.UI.pagesize || 8,
                    advancedUi: ["true", "On", true].includes(localStorage.advancedUi) ? "On" : "Off",
                    defTheme: localStorage.defTheme || "auto"
                }

                e.detail.instance.data = data;
            })
            .on("write", e => {

                let settings = e.detail.instance.data;
                pwa.UI.theme = settings.darkmode === "On" ? "dark" : "light";
                pwa.UI.pagesize = settings.pagesize;
                localStorage.advancedUi = settings.advancedUi === "On" ? "On" : "Off"
                localStorage.defTheme = settings.defTheme
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