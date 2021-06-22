# UI

## Areas

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



## Notifications

```js
pwa.UI.notifications.add(`Items deleted`, {
    type: "info",
    timeout: 3000,
    buttons: {
    undo: {
        caption: "Undo",
        click: (ev) => {
            this.undo("delete", this.selection)
        },
    },
    },
});
```

## Dialogs

