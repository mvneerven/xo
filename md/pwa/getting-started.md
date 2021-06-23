# Getting started with PWA

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

Where each route module imherits from *xo.route*:

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

## Further reading

- [UI](./ui.md)
- [Router](./router.md)
- [OmniBox](./omnibox.md)

