class SettingsRoute extends xo.route {

    menuTitle = "Settings";

    title = "Edit Settings"

    menuIcon = "ti-settings";


    constructor() {
        super(...arguments);

        pwa.on("omnibox-init", e => {
            e.detail.options.categories["Settings"] = {
                sortIndex: 5,
                trigger: options => { return options.search.length >= 2 },
                getItems: async options => {
                    return this.collectSettings().filter(i => {
                        let text = `${i.name} ${i.title}`.toLowerCase();
                        return text.indexOf(options.search) > -1;
                    }).map(r => {
                        return {
                            text: "Settings/" + r.title,
                            description: "Go to settings",
                            field: r.name
                        }
                    })
                },
                text: "Search for '%search%' products",
                icon: "ti-package",
                action: options => {
                    document.location.hash = "/settings/" + options.field
                }
            }
        })
    }

    async render(path) {
        let frm = await pwa.settings.render({
            on: {
                interactive: e => {
                    
                }
            }
        });
        this.area.add(frm);
    }

    get area() {
        return this.app.UI.areas.main;
    }



    collectSettings() {
        let ar = [];

        pwa.router.modules.forEach(r => {
            if (!r.hidden) {
                if (r.module.settings) {
                    ar = ar.concat(r.module.settings.settings);
                }
            }
        });

        return ar;
    }
}

export default SettingsRoute;