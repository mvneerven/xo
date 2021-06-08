# PWA

PWA consists of the following 

- Progressive Web App (SPA) helpers
- Simple Router
- UI building features
- Utility methods

Create a PWA container:

```js
class PWA extends xo.pwa {
    ...
}
```

Set it up with some routes:
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

Where:

```js
class HomeRoute extends xo.route {

    title = "Home";

    menuIcon = "ti-home";

    async render(path) {
        let div = DOM.parseHTML('<div>Hello World!</div>');
        this.area.add(div);
    }

    get area() {
        return this.app.UI.areas.main;
    }
}
```

