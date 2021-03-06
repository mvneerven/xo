# Getting started with XO form

## Basic HTML

Let's start by simply showing a complete HTML page that runs an XO form schema.
In this case, we simply use the CDN references for XO (CSS & JS):

*[Test this HTML](/base.html)*

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Starting with XO form</title>
    <style>@import url(https://xo-js.dev/v1.4/xo.css);</style>
</head>
<body>
    <h1>Starting with XO form</h1>
    <section id="form"></section>
    <script type="module" src="https://xo-js.dev/v1.4/xo.min.js"></script>
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

In ```xo.form.run()```, you provide a schema (inline or URL), and an (optional) ```options``` object. 

Apart from the ```on``` property, for events, the ```options``` object can have numerous settings for XO form runtime. For instance, the [context](../refdocs/src-exo-core_ExoFormContext.md) property is used to pass state to the form.

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

### XO form in Frontend Frameworks (Vue, React, Angular, etc.)

- [CodePen Vue Example](https://codepen.io/isazulay/pen/ExWBgEJ)
- [Vue & XO form integration (GitHub)](https://github.com/inbarazulay1997/xo-examples) by Inbar Azulay

## More reading

- [Understanding XO form](./understanding-exoform.md)
- [XO form events](./events.md)