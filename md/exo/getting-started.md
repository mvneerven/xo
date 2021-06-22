# Getting started with ExoForm

```js
document.body.appendChild(await xo.form.run("/data/forms/mi.js"));
```

You still have access to all functionaliy:

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

... providing a preexisting *ExoFormContext* object:

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

... but you can also render single controls:

```js
let div = await xo.form.run({
  type: "aceeditor",
  name: "htmlEditor",
  caption: "Html"
});
```