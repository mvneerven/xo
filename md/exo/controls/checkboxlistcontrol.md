# Controls: CheckboxList

The ```checkboxlist``` control is used for multi-selection of options.

```js
const schema = {
  pages: [
    {
      fields: [
        {
          type: "checkboxlist",
          name: "checkboxlist1",
          caption: "Choices",
          items: [
            "First",
            "Second"
            "Third"
          ]
        }
      ]
    }
  ]
}
```

Options can be declared as strings, but can also be object structures:

```js
const schema = {
  pages: [
    {
      fields: [
        {
          type: "checkboxlist",
          name: "checkboxlist1",
          caption: "Choices",
          items: [
             {value: 1, name: "First"}
             {value: 2, name: "Second"}1
             {value: 3, name: "Third"}
          ]
        }
      ]
    }
  ]
}
```

The items property can also be a pointer to a URL:

```js
const schema = {
  pages: [
    {
      fields: [
        {
          type: "checkboxlist",
          name: "checkboxlist1",
          caption: "Choices",
          items: "/data/multi-select-options.json"
        }
      ]
    }
  ]
}
```

... where ```multi-select-options.json``` contains the following data:

```json
[
  {"value": 1, "name": "First"},
  {"value": 2, "name": "Second"},
  {"value": 3, "name": "Third"}
]
```

In fact, the ```items``` property supports inline data, URL, or a function or Promise that resolves an array of options.

> For more complex multi-select scenarios, consider using [ListView](./listview-control.md)

## DataBinding

In databinding scenarios, you can have both the options and the selection bind to elements in your model.

In the case below, the options are bound to a ```checks``` property on the ```options``` instance, while the selection (control value) is bound to ```data.selectedItems```:

```js
const schema = {
  model: {
    instance: {
      options: {
        checks: [
          {
            value: 1,
            name: "First"
          },
          {
            value: 2,
            name: "Second"
          },
          {
            value: 3,
            name: "Third"
          }
        ]
      },
      data: {
        selectedItems: [
          2
        ]
      }
    }
  },
  pages: [
    {
      fields: [
        {
          type: "checkboxlist",
          name: "checkboxlist1",
          caption: "Choices",
          bind: "instance.data.selectedItems",
          items: "@instance.options.checks"
        }
      ]
    }
  ]
}
```