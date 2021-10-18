# Validation

By default, XO form uses HTML5 validations

You can specify inline validation mode as follows, in the root node of the XO form schema:

```json
{
  "validation": "inline"
}
```

If you want to have inline validation the default for all forms, specify it as a default at ExoFormContext creation time:

```javascript
// set default validation to be 'inline' for all forms
const context = await window.xo.form.factory.build({
    defaults: {
        validation: "inline"
    }
});
```

Then, pass the context at form runtime:

```js
let frm = await xo.form.run("/data/forms/account.json", {
    context: context,
    on: {
        post: e=>{
            // handle post
        }
    }
});

