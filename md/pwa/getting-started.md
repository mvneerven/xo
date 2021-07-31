# Getting started with PWA

## PWA/SPA: what's in an acronym

A [PWA](https://web.dev/progressive-web-apps/) (Progressive Web Application) is a special form of a [SPA](https://en.wikipedia.org/wiki/Single-page_application) (Single Page Application), a modern way of building web frontends in a purely static way, with mostly a single page that changes using JavaScript & CSS, and interfaces with Server logic using well defined REST interfaces and JSON.

PWA technology is still in development, but the gap between PWAs and native mobile/tablet app and even desktop apps is closing quickly.

XO includes a few building blocks for efficient PWA building, including a router, Event handler, DOM helpers, etc.

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

