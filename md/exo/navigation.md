# The *navigation* property


```json
{
  "navigation": "auto"
}
```

## Values for navigation

- none
- auto
- static
- wizard
- survey
- tabstrip


# Controls

The Form Control for navigation and submit can now be optionally included in the Form schema.

```js
const schema = {
    model: {
        // ...
    },
    pages: [
        // ...
    ],
    controls: [
        {
            name: "reset",
            type: "button",
            caption: "Back to page one",
            class: "form-reset"
        },
        {
            name: "prev",
            type: "button",
            caption: "◁ Back",
            class: "form-prev"
        },
        {
            name: "next",
            type: "button",
            class: "form-next"
        },
        {
            name: "send",
            type: "button",
            caption: "Submit",
            class: "form-post"
        }
    ]
}
```

If you don't have a controls array in your schema, XO form will revert to the default behavior based on the selected *navigation* type. For instance, if your *navigation* setting is 'auto' (or not specified in the schema), and your schema consists of one page, the following code will be injected into the runtime schema:

```js
controls = [
  {
    name: "send",
    type: "button",
    caption: "Submit",
    class: "form-post"
  }
]
```

... while if *navigation* is set to 'wizard' (or 'auto'/missing with more than one page specified), the following code will be provisioned:

```js
controls = [
  {
    name: "prev",
    type: "button",
    caption: "◁ Back",
    class: "form-prev"
  },
  {
    name: "next",
    type: "button",
    caption: "Next ▷",
    class: "form-next"
  },
  {
    name: "send",
    type: "button",
    caption: "Submit",
    class: "form-post"
  }
];
```

Apart from having control over button classes and captions, a major benefit of the explicit *controls* markup is in combination with data binding and logic.

Look at this code for instance:

```js
controls: [
    {
        name: "reset",
        type: "button",
        caption: "Back to page one",
        class: "form-reset",
        disabled: "@bindings.isFirstPage"
    },
    {
        name: "prev",
        type: "button",
        caption: "◁ Back",
        class: "form-prev"
    },
    {
        name: "next",
        type: "button",
        caption: "Next ▷",
        class: "form-next"
    },
    {
        name: "send",
        type: "button",
        caption: "Submit",
        class: "form-post",
        disabled: "@bindings.sendDisabled"
    }
]
```

You can see that here, button state is linked to changes that are defined in the model logic:

```js
model: {
    instance: {
        person: {
            name: {
                first: "John",
                last: "Doe"
            },
            age: 57,
            gender: "male"
        },
        contract: {
            agree: false
        }
    },
    logic: context => {
        const model = context.model, person = model.instance.person, 
        b = model.bindings, nav = context.exo.addins.navigation;
        b.isFirstPage = nav.currentPage === 1;
        b.sendDisabled = nav.;
    }
}
```

## Tabstrip Navigation

```js
const schema = {
    navigation: "tabstrip",
    pages: [{
        legend: "Details",
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
            }
        ]
    },
    {
        legend: "Extra",
        intro: "Add some extra stuff",
        fields: [
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
```

Result:

![TabStrip Navigation](https://xo-js.dev/assets/img/tabstrip-nav.png)
