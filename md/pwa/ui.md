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

### Working with Areas

Looking at the HTML above, PWA will set up the UI with an Areas object with 3 Area objects: header, main and footer.
These areas are then accessible as follows:

```js
pwa.UI.areas.main.add(<DOM element or HTML>)
```

Each area is rendered as a DIV. You can also get a reference to the DIV directly:

```js
let areaDiv = pwa.UI.areas.main.element;
```


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

You can trigger modal and modeless dialogs easily from your apps.

```js
pwa.UI.showDialog({
    modal: true,
    title: "Are you sure?",
    body: `You're about to delete your account. This action cannot be undone.`,
    confirmText: "Delete my Account",

    click: async (button, event) => {
        if (button === "confirm") {
            try {
                await this.confirmDeleteAccount(usf)
            }
            catch (ex) {
                console.error("deleteAccount()", ex);
            }
        }
    }
});
```