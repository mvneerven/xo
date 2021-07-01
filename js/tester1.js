const Core = xo.core;
const DOM = xo.dom;

class HomeRoute extends xo.route {

    title = "Home";

    menuIcon = "ti-home";

    async render(path) {

    }

    get area() {
        return this.app.UI.areas.main;
    }


}

class TestRoute extends xo.route {

    title = "Test";

    menuIcon = "ti-gift";

    hidden = true;


    async render() {

        let btn = document.createElement("button")
        btn.innerHTML = "Login"
        btn.addEventListener("click", async e => {
            let x = await pwa.msid.clientApp.loginPopup();
            pwa.account=x.account;
        })

        this.area.add(btn)

        let btn1 = document.createElement("button")
        btn1.innerHTML = "API"
        btn1.addEventListener("click", async e => {
            let x = await pwa.getToken();
            debugger;
        })

        this.area.add(btn1)


    }

    get area() {
        return this.app.UI.areas.main;
    }
}

class PWA extends xo.pwa {
    routerReady() {

        this.omniBox = new PWA.OmniBox({
            useRoutes: r => {
                return true
            },
            placeholder: "The start of everything...",
            tooltip: "Navigate through this app by clicking & typing here..",

            categories: {
                Google: {
                    sortIndex: 500,
                    trigger: options => { return options.results.length === 0 && options.search.length >= 2 },
                    text: "Search on Google for '%search%'",
                    getItems: options => {
                        return [{
                            text: "Search on Google for '%search%'"
                        }]
                    },
                    icon: "ti-search",
                    action: options => {
                        options.url = `https://www.google.com/search?q=${options.search}`;
                    },
                    newTab: true
                },

                Images: {
                    sortIndex: 600,
                    trigger: options => { return options.search.length >= 2 },
                    getItems: options => {
                        return [{
                            text: "Search images on Pexels for '%search%'"
                        }]
                    },
                    action: options => {
                        options.url = `https://www.pexels.com/search/${options.search}`;
                    },
                    newTab: true,
                    text: "Search for '%search%' images",
                    icon: "ti-image"
                },

                Products: {
                    sortIndex: 100,
                    trigger: options => { return options.search.length >= 2 },
                    getItems: options => {
                        return [{
                            text: "Search products with term/tag '%search%'"
                        }]
                    },
                    text: "Search for '%search%' products",
                    icon: "ti-package",
                    action: options => {
                        document.location.hash = `/products/${options.search}`;
                    }
                }
            }
        });

        this.omniBox.render().then(elm => {
            this.UI.areas.header.add(elm)
        })

        // this.router.generateMenu(this.UI.areas.menu, m => {
        //     return m.name !== "SettingsRoute"
        // });
    }

    async asyncInit() {
        return this.setupMsal();
    }

    setupMsal() {
        const options = this.config.identity.msidp;
        options.msal.auth.redirectUri = document.URL.split("#")[0];
        options.msal.auth.redirect_uri = document.URL.split("#")[0];

        return new Promise((resolve, reject) => {
            this.msid = new xo.identity.msal(options);
            this.msid.load().then((msid) => {
                this.account = this.msid.account;
                console.log("MSID loaded", this.msid);

                resolve();
            });
        });
    }

    async getToken() {
        console.log("Getting JWT token. Account: ", this.account);
    
        if (this.account) {
          let jwt = await this.msid.getJWT(this.account.username);
          debugger
          return jwt;
        }
        
        
        console.log("Bypassing JWT token. No account");

        return Promise.resolve();
      }
}

fetch("/data/config.json").then(x=>x.json()).then(options=>{
    window.pwa = new PWA({
        ...options,
        routes: {
            "/": HomeRoute,
            "/test": TestRoute
        }
    });
})
