# History & Hash Based SPA Router

The XO PWA component includes a router component that automatically calls the ```render()``` method of the given Router Modules when the user navigates to the corresponding route.

```js
new PWA({
    router: "history",
    routes: {
        "/": HomeRoute,
        "/test": TestRoute,
        "/settings": SettingsRoute,
        "/help": HelpRoute
    }
})
```

A router module implementation looks like this:

```js
class HomeRoute extends xo.route {

    title = "Home";
    menuIcon = "ti-home";

    async render(path) {
        let frm = await xo.form.run("/data/forms/myhomeform.js", {
            context: pwa.exoContext,
                on: {
                    post: e => {
                        // handle e.detail.postData
                    }
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

# Using only the Router

If you don't want to use a full blown PWA component, but need a SPA router, you can use the extremely lightweight underlying ```Router``` component:

```js
const router = new xo.pwa.Router({
    type: "history",
    routes: {
        "/": "home",
        "/about": "about",
        "/products": "products"
    }
}).listen().on("route", e=>{
    console.log(e.detail.route, e.detail.url);
})
```

As you can see, the only thing the Router component does is dispatch events when one of the routes is targeted. Contrary to the PWA component's router, it doesn't assume components that implement ```RouterModule``` and expect a certain HTML setup (See [UI](./ui.md)).

