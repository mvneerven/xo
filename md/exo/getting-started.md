# Getting started with ExoForm

## Installing

### CDN

Use XO directly from the CDN:

```html
<script src="https://xo-js.dev/v1.3/xo.js"></script>
or...
<script src="https://xo-js.dev/v1.3/xo.min.js"></script>
```

### NPM
... or get the latest [NPM package](https://www.npmjs.com/package/@mvneerven/xo-js)


## Writing Declarative ExoForm schemas (JSON/JS)

Start by using the [ExoForm Studio](https://www.xo-js.dev/#/studio), or try the [ExoForm Examples](https://codepen.io/collection/XLwaxp) on CodePen.


## Minimal Form / ExoForm Hello World

In its most simple form, this is what an ExoForm schema looks like:

```js 
let div = await xo.form.run({
  pages: [
    {
      legend: "My Form",
      intro: "My form description",
      fields: [
        {
          name: "text1",
          caption: "Text",
          type: "text"
        }
      ]
    }
  ]
});
```

## Run ExoForm inside your own Frontend Code

Use ```xo.form.run()``` to run a form schema:

```js 
let div = await xo.form.run(schema[, settings]);
```

Where *schema* can be a literal (JSON/JS) or a URL, and *settings* an optional object. See [Getting Started](./getting-started.md)


```js
document.body.appendChild(await xo.form.run("/data/forms/mi.js"));
```

... but you can also render single controls:

```js
let div = await xo.form.run({
  type: "aceeditor",
  name: "htmlEditor",
  caption: "Html"
});
```

### Accessing extended functionality

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