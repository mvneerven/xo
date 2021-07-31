# Getting started with ExoForm

## Basic HTML

Let's start by simply showing a complete HTML page that runs an ExoForm schema.
In this case, we simply use the CDN references for XO (CSS & JS):

*[Test this HTML](/base.html)*

```html
<!DOCTYPE html>
<html lang="en" class="theme-light">

<head>
    <title>ExoForm, The Basics</title>
    <style>
        @import url(https://xo-js.dev/v1.4/xo.css);
        @import url(https://fonts.googleapis.com/css2?family=Exo&display=swap);
        body, H1 {
            font-family: Exo;
        }
    </style>
</head>

<body>
    <h1>ExoForm, The Basics</h1>
    <p>
        This page illustrates just how little is needed to get going with ExoForm...
    </p>

    <script type="module" src="https://xo-js.dev/v1.4/xo.js"></script>

    <script type="module">
        const schema = {
            pages: [{
                legend: "My Form",
                intro: "Fill in your details",
                fields: [
                    {
                        type: "name",
                        name: "name",
                        caption: "Enter name",
                        required: true
                    },
                    {
                        type: "email",
                        name: "email",
                        required: true,
                        placeholder: "john@doe.com",
                        caption: "Enter email address"
                    },
                    {
                        type: "multiline",
                        name: "msg",
                        caption: "Message",
                        placeholder: "My message for you...",
                        autogrow: true
                    },
                    {
                        type: "dropdown",
                        name: "favpet",
                        caption: "Favorite pet",
                        items: ["Dog", "Cat", "Bunny", "Hamster", "Bird", "Snake", "Pig"]
                    },
                    {
                        type: "tags",
                        name: "tags",
                        caption: "Skills",
                        value: ["C#", "JavaScript", "Azure", "JSON"]
                    }

                ]
            }]
        }
        const frm = await xo.form.run(schema, {
            on: {
                post: e => {
                    alert(JSON.stringify(e.detail.postData, null, 2))
                }
            }
        })
        document.body.appendChild(frm);
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