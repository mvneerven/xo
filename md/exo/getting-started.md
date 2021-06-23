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

## Basic Syntax 

In its most simple form, this is what an ExoForm schema looks like:

```json
{
  <optional settings>,
  "pages": [
    {
      "fields": [
         <list of field subschemas>
      ]
    }
  ]
}
```

... where each field subschema looks like this:

```json
{
    "name": "<unique name>",
    "caption": "<label text>",
    "type": "<exoform control type>",
    <extra properties>
}
```

### Hello World

```json
{
  "pages": [
    {
      "fields": [
        {
          "name": "myTextField",
          "caption": "Hello World",
          "type": "text"
        }
      ]
    }
  ]
}
```
... or in JavaScript Literal notation:

```js run
const schema = {
  pages: [
    {
      fields: [
        {
          name: "myTextField",
          caption: "Hello World",
          type: "text"
        }
      ]
    }
  ]
}
```


## Run ExoForm inside your own Frontend Code

### Basic Syntax

Use ```xo.form.run()``` to run a form schema 

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