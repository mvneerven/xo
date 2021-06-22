# PWA

When Building Single Page Applications (SPAs) and Progressive Web Apps (PWAs), you need a few things to be taken care of while you focus on building features.

The XO PWA class gives you:

- A hash based Router
- UI building features (areas, dialoga, notifications, etc)
- [The OmniBox](./omnibox.md)
- Utility methods (DOM parsing, etc)

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

## HTML - Areas

PWA works with *areas* you can access from your components, as you can see above.

These areas must be declared using the *data-pwa-area* attribute:

```html
<body>
    <header data-pwa-area="header"></header>
    <main>
        <section data-pwa-area="main" data-reset="route"></section>
    </main>
    <footer data-pwa-area="footer"></footer>
</body>
</html>
```

You can use the ```data-reset="route"``` in the HTML to specify the area should be cleared on route change.

