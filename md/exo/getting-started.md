# Getting started with ExoForm

## Basic HTML

Let's start by simply showing a complete HTML page that runs an ExoForm schema.
In this case, we simply use the CDN references for XO (CSS & JS):

*[Test this HTML](/base.html)*

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Starting with ExoForm</title>
    <style>@import url(https://xo-js.dev/v1.4/xo.css);</style>
</head>
<body>
    <h1>Starting with ExoForm</h1>
    <section id="form"></section>
    <script type="module" src="https://xo-js.dev/v1.4/xo.js"></script>
    <script type="module">
        const schema = {
            pages: [{
                fields: [
                    {
                        type: "name",
                        name: "name",
                        caption: "Enter your name"
                    }
                ]
            }]
        }
        document.getElementById("form").appendChild(await xo.form.run(schema, {
            on: {
                post: e => {
                    alert(JSON.stringify(e.detail.postData, null, 2))
                }
            }
        }));
    </script>
</body>
</html>
```

## Installing

As you've seen in the example above, you can run XO directly from the CDN:

> Use ```/xo.js``` for debugging

... or get the latest [NPM package](https://www.npmjs.com/package/@mvneerven/xo-js)

### Providing a preexisting *ExoFormContext* object

As you've seen, in ```xo.form.run()```, you provide a schema (inline or URL), and an ```options``` object. 

Apart from the ```on``` property, for events, the ```options``` object can have numerous settings for ExoForm runtime. For instance, the [context](../refdocs/src-exo-core_ExoFormContext.md) property is used to pass state to the form.

See [Custom Controls](./controls/building-controls.md)

```js
const frm = await xo.form.run(schema, {
    context: this.exoFormContext, // previously constructed
    on: {
        post: e => {
            alert(JSON.stringify(e.detail.postData, null, 2))
        }
    }
})
document.body.appendChild(frm);
```

### ExoForm in Frontend Frameworks (Vue, React, Angular, etc.)

- [CodePen Vue Example](https://codepen.io/isazulay/pen/ExWBgEJ)
- [Vue & ExoForm integration (GitHub)](https://github.com/inbarazulay1997/xo-examples) by Inbar Azulay

## More reading

- [Understanding ExoForm](./understanding-exoform.md)
- [ExoForm events](./events.md)