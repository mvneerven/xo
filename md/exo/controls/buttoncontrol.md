# Controls: Button

Basic usage:

```js
{
    type: "button",
    name: "btn1",
    caption: "Press me!"
}
```

## How to work with buttons in XO form

A button has a clear purpose: something needs to happen when users click it.
In most programming languages, you would add an event listener and hook up the 'click' event, but if you want to keep things *declarative*, that's breaking with the very nature of your environment.

Of course, every bit of UI that we generate using XO form behaves like any other web citizen and can be manipulated in the DOM, events attached to, etc., but if you keep things declarative, there are other options.

### Standard Actions

Using the ```action``` parameter, you can specify a number of standard actions XO form can take when the user clicks the form.

- next -> next page
- back -> previous page
- goto:```pagenumber``` - goto specified page
- reset - back to page 1
- toggle:```controlname``` - toggle visibility of control
- show:```controlname``` - show control
- hide:```controlname``` - hide control

```js
const schema = {
  pages: [
    {
      legend: "Page 1",
      fields: [
        {
          name: "btn1",
          caption: "Go to page 3",
          type: "button",
          action: "goto:3"
        }
      ]
    },
    {
      legend: "Page 2",
      fields: [
        {
          type: "nladdress",
          name: "nladdress1",
          caption: "Address"
        }
      ]
    },
    {
      legend: "Page 3",
      fields: [
        {
          type: "creditcard",
          name: "cc1",
          caption: "Credit Card"
        }
      ]
    }
  ]
}
```

Show/hide control

```json
{
  "pages": [
    {
      "fields": [
          {
          "name": "btn1",
          "caption": "Show email",
          "type": "button",
          "action": "toggle:eml1"
        },
        
        {
          "name": "eml1",
          "caption": "Your email",
          "type": "email",
          "visible": false
        }
      ]
    }
  ]
}
```

> NOTE: be careful with hiding pieces of UI, especially in combination with required values.

### Custom actions

Besides the built-in actions, you can use the ```action``` parameter to trigger events in the execution environment:

```js
const schema = {
  pages: [
    {
      fields: [
        {
          name: "btn1",
          caption: "Test button",
          type: "button",
          action: "testme"
        }
      ]
    }
  ]
}
let frm = await xo.form.run(schema, {
    on: {
        action: e => {
            alert(e.detail.action) // testme
        }
    }
});
```

### Ussing ```click``` event handling

In cases where you have a hybrid XO form/JS environment and control the full execution (or even generate/modify the XO form schema programmatically), you can also use the ```click``` property to directly bind your event handlers:

```js
const schema = {
  pages: [
    {
      fields: [
        {
          name: "btn1",
          caption: "Test button",
          type: "button",
          click: e => {
              // handle the click
          }
        }
      ]
    }
  ]
}
```

> Note: you can not test this scenario in XO form Studio, since direct event handlers are not supported in the editor.

### Data Binding

As with many controls, you can also bind the state of a button control to a property in your model, and act on it.

In this example, the button value, which is bound to ```instance.data.btn1Clicked``` is updated on click:


```js
const schema = {
  model: {
    instance: {
      data: {
        btn1Clicked: "no"
      }
    }
  },
  pages: [
    {
      legend: "My Form",
      intro: "Button clicked: @instance.data.btn1Clicked",
      fields: [
        {
          name: "btn1",
          caption: "A Button",
          type: "button",
          value: "yes",
          bind: "instance.data.btn1Clicked"
        }
      ]
    }
  ]
}
```

## Dropdown buttons

The ```dropdown``` property can be used to show a dropdown on hover.

```js
xo.form.run(
    {
        pages: [
            {

                fields: [{
                    type: "button",
                    icon: "ti-menu",
                    name: "dropper",
                    dropdown: [
                        {
                          caption: `Select all`,
                          icon: "ti-check-box",
                          tooltip: "Select all",
                          action: "select"
                          
                        },
                        {
                          caption: `Deselect all`,
                          icon: "ti-layout-width-full",
                          tooltip: "Deselect all",
                          action: "deselect"
                        },
                      ]
                }]
            }
        ]
    }, {
        on: {
            action: e=>{
                // e.detail.action -> ...
                // e.detail.isDropDown -> true
            }
        }
    }
).then(x => {

    area.appendChild(x)

})
```

### Dropdown Events

- beforeDropdown event triggered when hovering buttons with dropdowns 
  - dropdownItems -> dropdown li collection
  - buttonControl -> button control instance
- beforeContextMenu event triggered when hovering contextmenu in listview
  - dropdownItems -> dropdown li collection
  - buttonControl -> button control instance
  - domItem: list item DOM lement the contextmenu is shown for
  - item: the item in the current dataset the contextmenu is shown for