# Debugging XO Forms

XO has a pretty straightforward [parsing & rendering](./understanding-exoform.md) process. But since XO Forms are just data, declaratively instructing what needs to be rendered, it is naturally a bit harder to debug and trace everything that's happening at runtime.

## Logging
When you run a form, there's a lot of logging going on. Most of it is under the ```debug``` category, so you might need to adjust the filter to 'All levels'.

![Portal](https://xo-js.dev/assets/img/xo-logging.png "Debug log in Chrome/Edge Chromium developer console")

## Breaking
Obviously, by opening xo.js in the developer console sources, you can set any breakpoint in the XO code. But finding where to break can be hard at first.

To make things easier, we've added a ```break``` property you can set inside a field schema, so XO will break in the ```render()``` method.

## In your own development environment

Make sure you use ```xo.js```, not the minified version, ```xo.min.js```, during debugging.

During runtime, there are plenty of XO events you can hook into. Just look at ```xo.form.factory.events```:

```js
const frm = await xo.form.run(schema, {
    context: this.exoFormContext, // previously constructed
    on: {
        schemaLoaded: e => {
            // your code
        },
        interactive: e=> {
            // your code
        }
    }
})
document.body.appendChild(frm);
```

