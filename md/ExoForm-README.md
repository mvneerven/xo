# ExoForm 'Hello World'

Basic JavaScript Flow (1.2+):

```js 
let div = await xo.form.run(schema[, settings]);
```

Where *schema* can be a literal (JSON/JS) or a URL, and *settings* an optional object.

## Minimal Form

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
