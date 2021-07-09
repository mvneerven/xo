# Getting started with ExoForm

## Installing

### CDN

Use XO directly from the CDN:

```html
<script src="https://xo-js.dev/v1.4/xo.js"></script>
```

or...

```html
<script src="https://xo-js.dev/v1.4/xo.min.js"></script>
```

### NPM
... or get the latest [NPM package](https://www.npmjs.com/package/@mvneerven/xo-js)


## Writing Declarative ExoForm schemas (JSON/JS)

Start by using the [ExoForm Studio](https://www.xo-js.dev/#/studio), or try the [ExoForm Examples](https://codepen.io/collection/XLwaxp) on CodePen.


## Minimal Form / ExoForm Hello World

In its most simple form, an ExoForm schema has the following structure:

```json
{
  "pages": [
    {
      "fields": [

        {
          "type": "<field type>",
          "name": "<field name>",
          "caption": "<field caption>"
        }

      ]
    }
  ]
}
```

Here's an example of a one-page, one-field form:

```js
const schema = {
  pages: [{
      fields: [{
          type: "text",
          name: "txt1",
          caption: "Enter text"          
        }]
    }]
}
```

Use ```xo.form.run()``` to run a form schema:

```js 
let div = await xo.form.run(schema);
```

The ExoForm *schema* can be passed in as a literal (JSON/JS) or a URL:

```js
document.body.appendChild(await xo.form.run("/data/forms/mi.js"));
```


### Usimg the ```options``` parameter to access extended functionality

```js
myDiv.appendChild(await xo.form.run("/data/forms/mi.js", {
    on: {
        post: e => {
            // work with e.detail.postData
        },
        page: e => {
            // e.detail.from -> e.detail.page
        }
    }
}));
```

### Providing a preexisting *ExoFormContext* object:

See [Custom Controls](./xo-custom-controls.md)

```js
xo.form.run("/data/forms/account.json", {
    context: this.xoContext,
    on: {
        post: e=>{
            // handle post
        }
    }
}).then( elm => {
    myDiv.appendChild(elm)
})
```

### ExoForm in Frontend Frameworks (Vue, React, Angular, etc.)

- [CodePen Vue Example](https://codepen.io/isazulay/pen/ExWBgEJ)
- [Vue & ExoForm integration (GitHub)](https://github.com/inbarazulay1997/xo-examples) by Inbar Azulay

## More reading

- [ExoForm events](./events.md)