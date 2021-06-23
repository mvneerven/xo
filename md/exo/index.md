# XO Form Component (a.k.a ExoForm)

ExoForm is a Declarative Web Forms Engine written in pure ES6 JavaScript.

## ExoForm Benefits

* Build complex (data-bound) Web Forms, Wizards, Surveys using *declarative* JSON/JS code.
* No bulky dependencies. HTML5, CSS3, ECMAScript. That's it. They're powerful enough ;-) 
* Use it in any environment, Vue, React, Angular, or plain vanilla JavaScript. 
* Create and include your own control libraries. 
* Complete freedom for Frontend Devs: customize styling, validation, navigation, progress indication, etc. 
* Get typed JSON post data or sync to a data model (optionally using JSON Schema)
* All HTML5 controls included, plus a large number of custom controls, including wrappers for the Ace Code Editor wrapp, the CkEditor WYSIWYG/HTML editor 
* Autocompletion (using standard HTML5 DataLists, fixed lists, or dynamic API searches)
* Customizable built-in validation, navigation, progress indication types (or roll your own using the addins interface)


Basic JavaScript Flow (1.2+):

```js 
let div = await xo.form.run(schema[, settings]);
```

Where *schema* can be a literal (JSON/JS) or a URL, and *settings* an optional object. See [Getting Started](./getting-started.md)

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

# See Also:

- [Getting Started](./getting-started.md)
- [ExoForm Databinding](./data-binding.md)
- [JSON Schemas](./json-schema.md)

