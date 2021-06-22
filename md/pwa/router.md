# PWA Router

The XO-JS PWA implementation includes a simple hash based router.

In fact, when creating a PWA instance, you have to pass in an object that includes the routes and the classes that handle them:

```js
new PWA({
    routes: {
        "/": HomeRoute,
        "/test": TestRoute,
        "/settings": SettingsRoute,
        "/help": HelpRoute
    }
})
```

Each route is handled by a class that inherits from *RouteModule* (xo.route).

```js
class HomeRoute extends xo.route {

    title = "Home";

    menuIcon = "ti-home";

    async render(path) {
        try {
            await this.renderForm(path);
        }
        catch (ex) {
            this.app.UI.areas.main.add("Could not render form: " + ex.toString)
        }
    }

    async renderForm(path) {
        let frm = await xo.form.run("/data/forms/myhomeform.js", {
            context: pwa.exoContext,
            on: {
                post: e => {
                    // handle e.detail.postData
                }
            }
        });
        this.area.add(frm);
    }

    get area() {
        return pwa.UI.areas.main;
    }
}
```

