# XO-JS Revision History 

# New in 2.0

## Component Model
XO Form Schemas are now compiled into a full recursive component model, before recursively rendering the component tree.

A tree of components is now instantiated at JSON/JS parsing time, with every component having a ```parent``` and ```children```, and the rendering process is fully delegated to the individual controls.

It all starts with the ```root``` control (```ExoRootControl```), that takes care of setting up the page/pages and the navigation control container (```ExoNavControl```).

There is now a clear separation of parsing and accepting field properties in controls (```acceptProperties()```), that takes place in the control component constructor, and application of property values (```mapAcceptedProperties()```), where you can apply the state as passed through the JSON/JS field properties directly, or through databinding, to the state of your component.

As mentioned above, each control that can have children (fieldset, multiinput, group, root, etc.) is now responsible for rendering subcomponents. This means that anyone can create a nesting and the schema can be extended in many ways.

## Reactive Databinding

Reactive data binding has been drastically improved.
You can now simply bind nearly every schema property directly to a property in one of the model instances.

For instance, enabling controls based on state in the model is now much simpler, because you can now use model variables directly.

See below (```enabled: "#/ui/useemail"```):

```js
const schema = {
  model: {
    instance: {
      ui: {
        useemail: true
      },
      data: {
        email: ""
      }
    }
  },
  theme: "thin",
  pages: [
    {
      legend: "My First XO Form",
      fields: [
        {
          type: "checkbox",
          caption: "Use email",
          bind: "#/ui/useemail"
        },
        {
          type: "email",
          caption: "Your email",
          bind: "#/data/email",
          required: true,
          placeholder: "john@doe.com",
          enabled: "#/ui/useemail",
          prefix: {
            icon: "ti-email"
          }
        }
      ]
    }
  ]
};
```


## Better Performance & Less Memory used

The XO Form engine has been optimized in many ways, 

XO now uses consideraby less memory and cleans up used memory earlier.



## UI Tests included 

The integrity of the XO platform is fully tested using a built-in test suite.



![UI Test Suite](https://xo-js.dev/assets/img/ui-tests.png "UI Tests Integrated in XO Portal")

We are continously working on the expansion of the number of tests.




# New in 1.6

## Themes upgrade

We have completely rewritten XO theming, for easier use and extension.

A new theme, `thin` has been added, and default form layout has been improved so that custom styling is a lot easier.

See [Themes & Styling](./md/exo/theming.md)

## Monaco Editor

See [XO Studio](./md/exo/studio.md) now uses the Microsoft [Monaco Editor](https://microsoft.github.io/monaco-editor/) (yes, the one that powers #VSCode), complete with custom XO Form intellisense!

![Monaco](https://xo-js.dev/assets/img/monaco-autocomplete.png "Monaco Editor with autocomplete")

The underlying XO Form Control is `xoformeditor`, which is a wrapper around the new `monacoeditor`, which is more generic.

```js
{
  type: "monacoeditor",
  caption: "Monacoeditor",
  bind: "#/data/html",
  language: "html",
  class: "full-height",
  options: {
    minimap: {
      enabled: false
    }
  }
}
```

> Note: See [Monaco documentation for IEditorConstructionOptions](https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.IEditorConstructionOptions.html) for the ```options``` property.






# New in 1.5

## Breaking Change in Model Binding and Rules

> ### Databinding syntax 
> Binding syntax is now: `#/instancename/property` instead of `instance.instancename.property`
> 
> Also, the binding syntax is globally the same, so you no longer need to use a '@' outside the `bind` property.

## Model Binding shortcutting syntax

So if your model looks like this:

```js
model: {
  instance: {
    data: {
      email: "john@doe.com";
    }
  }
}
```

... You can bind the email property using this syntax:

```js
{
    type: "email",
    caption: "Email address",
    bind: "#/data/email"
}
```

## Rule Engine

We added a [rules engine](./md/exo/rules.md) that model based. Rules can be triggered based on [state in your model](./md/exo/data-binding.md).

## Default `xo.form.run()` options

You can now add defaults for the options passed to each form `xo.form.run()` when creating the xo form context:

```js
const context = await xo.form.factory.build({
  defaults: {
    validation: "inline",
  },
  runOptions: {
    rules: {
      actions: {
        myCustomAction: (a, b) => {
          // my custom implementation
        },
      },
    },
  },
});
```

In the example above, the [Rules Engine](./md/exo/rules.md) is being instructed that, apart from the internal actions the XO Rules Engine provides, a `myCustomAction` action exists, and all forms that are run can use it.

Just don't forget to pass the context created to the form runner:

```js
let fr = await xo.form.run(schema, {
  context: context,
});
```

### Event ruleContextReady

The `ruleContextReady` is dispatched when the Rules Engine is ready to execute rules.
Use it to get access to the `context` of the rules engine:

```js
let fr = await xo.form.run(schema, {
  on: {
    ruleContextReady: (e) => {
      this.ruleContext = e.detail.context;
    },
  },
  rules: {
    actions: {
      myCustomAction: (a, b) => {
        alert(this.ruleContext.var(a));
      },
    },
  },
});
```

## Sandbox `subform` property

The sandbox control now has a `subform` property (boolean).
Setting `subform` to `true` will make the form loaded in the sandbox bind to a node in the master model.

```js
const schema = {
  model: {
    instance: {
      data: {
        test: "My Data",
        sub: {
          text: "Subform Control Data",
        },
      },
    },
  },
  pages: [
    {
      fields: [
        {
          caption: "Test Field",
          type: "text",
          bind: "#/data/test",
        },
        {
          type: "sandbox",
          bind: "#/data/sub",
          form: {
            schema: {
              pages: [
                {
                  fields: [
                    {
                      type: "text",
                      caption: "Subform Textbox",
                      bind: "#/data/text",
                    },
                  ],
                },
              ],
            },
          },
        },
      ],
    },
  ],
};
```

> Note the bind: "#/data/text" in the subform: the subform cannot have a model of itself in this case, and the node used in the `bind` property translates to an instance in the subform called 'data'.


## Tags control supports autocompletion

The `tags` control now also supports `autocomplete`, like all text controls.

```js
const schema = {
  submit: true,
  model: {
    instance: {
      you: {
        pets: ["Cat"],
      },
    },
  },
  pages: [
    {
      fields: [
        {
          type: "tags",
          bind: "#/you/pets",
          caption: "What pets do you have?",
          autocomplete: {
            strict: true,
            items: [
              "Dog",
              "Cat",
              "Parrot",
              "Rabbit",
              "Pig",
              "Snake",
              "Turtle",
              "Other",
            ],
          },
          info: "You can select multiple pets",
        },
      ],
    },
  ],
};
```

## Autocomplete settings (all text controls)

- The `autocomplete` settings now include a `strict` boolean setting, to allow only values from the autocomplete `items`.

## Rules Engine

- The action `navigate` was added to the list of available actions in the Rules Engine.

## Listview `edit`

You can now turn a `listview` control into a master-detail editor.
See [ListView Control](./md/exo/controls/listview-control.md)

## Model Binding

You can now point an instance to a URL.
See [Data Binding](./md/exo/data-binding.md)

## LiveEditor
The XO Form LiveEditor can now be automatically started, using the `auto: true` setting.

```js
const schema = {
  model: {
    instance: {
      data: {
        name: "",
      },
    },
  },
  pages: [
    {
      fields: [
        {
          type: "text",
          bind: "#/data/name",
          caption: "Enter your name",
        },
      ],
    },
  ],
};
document.getElementById("form").appendChild(
  await xo.form.run(schema, {
    on: {
      post: (e) => {
        alert(JSON.stringify(e.detail.postData, null, 2));
      },
      interactive: (e) => {
        let exo = e.detail.host;
        new xo.form.factory.LiveEditor(exo, {
          auto: true,
        }).on("schema-change", (e) => {
          debugger;
        });
      },
    },
  })
);
```

## Revamped Studio

![Portal](https://xo-js.dev/assets/img/side-by-side.png "Side by side code & rendering")


The XO Studio finally has side-by-side code & rendering, for immediate feedback on your code changes.

Also, you will now directly see model changes as well as posted form values in the 'Data' panel.

## Improved Error handling

We have done a lot to improve the error handling & debugging experience. Errors in your schema now lead to a friendlier and clearer message shown in the form rendering panel.

## OpenAPI support

XO now has better support for OpenAPI. For instance, when selecting OpenAPI in the Start wizard, you will now be able to select a schema to work with in the OpenAPI definition.

## New Router with history and hash support

A new Router is available, and the [PWA Router](./md/exo/../pwa/router.md) has been rewrittenn to use this history and hash routing suporting router.
The new router can also be used outside the [PWA](./md/pwa/index.md) component structure.



- Autocomplete search results can now return a complete HTML element, using the `element` property of the returned object array.

A new function `getInstance()`, is in fact a shortcut to get the data of any bound model instance.

```js
return await xo.form.run(schema, {
  on: {
    post: (e) => {
      let contact = e.detail.host.getInstance("contact");
      // work with contact instance data
    },
  },
});
```

## Adding details to triggered events in ```actions```

- You can now pass details when calling `trigger` action to trigger an event in the second parameter:

```js
{
  type: "button",
  caption: "Log in",
  value: "clicked",
  bind: "#/temp/loginbutton",
  actions: [
    {
      if: {
          is: "clicked"
      },
      do: {
          trigger: ["signed-in", {
              account: "#/temp/userName"
          }]
      }
    }
  ]
}
```

## addcaption property on list inputs

List inputs (radiobuttonlist, checkboxlist) now allow adding entries to the underlying array of `items`.

```js
const schema = {
  model: {
    instance: {
      data: {
        who: "",
        people: ["John", "Pete", "Harry"],
      },
    },
  },
  pages: [
    {
      legend: "Welcome to XO",
      intro: "This is a generated web form",
      fields: [
        {
          type: "radiobuttonlist",
          bind: "#/data/who",
          items: "#/data/people",
          addcaption: "Other person",
        },
      ],
    },
  ],
};
```

## AddCaption for live addition of list options

List inputs with `addcaption` now dispath events on the adding behavior:

```js
const schema = {
  model: {
    instance: {
      data: {
        who: "",
        selected: {},
        people: ["John", "Pete", "Harry"],
      },
    },
  },
  pages: [
    {
      legend: "Using 'addcaption'",
      intro: "This radiobuttonlist allows you to add options",
      fields: [
        {
          type: "radiobuttonlist",
          bind: "#/data/who",
          items: "#/data/people",
          addcaption: "Other person",
        },
        {
          type: "multiinput",
          name: "editor",
          disabled: true,
          bind: "#/data/selected",
          caption: "Edit",
          fields: {
            name: {
              type: "text",
              caption: "First name",
              disabled: true,
            },
            fullname: {
              type: "text",
              caption: "Full name",
            },
            email: {
              type: "email",
              caption: "Email address",
            },
          },
        },
      ],
    },
  ],
};

const fr = await xo.form.run(schema, {
  on: {
    dataModelChange: (e) => {
      this.exo = e.detail.host;

      if (e.detail.changeData?.path === "#/data/who") {
        let person = {
          fullname: e.detail.changeData?.newValue + " Doe",
        };
        e.detail.model.instance.data.selected = person;
        e.detail.host.get("editor").disabled = false;
      }
    },
    dom: {
      "add-item": (e) => {
        debugger;
      },
      "select-add": (e) => {
        this.exo.get("editor").disabled = true;
      },
    },
  },
});

this.app.UI.areas.main.add(fr);
```

## Other changes

- Progress mode `steps`: fix in navigating to shown page headers
- New Rules Engine action: focus. See [Rules Engine](./md/exo/rules.md)
- Command: `submit: false`, to suppress the automatically generated submit button.
  The command needs to be placed at the top level of your schema.

```js
const schema = {
  submit: false,
  pages: [
    {
      fields: [
        {
          type: "text",
          name: "name",
          caption: "Your name",
          placeholder: "John Doe",
        },
      ],
    },
  ],
};
```

## Fixes
- Fix in databinding: multiple fields binding to single value in model.
- Fixed scrolling in `autocomplete` controls
- Error handling in `getInstance()` method on form improved
- Validation checking didn't take disabled and invisible controls out of the equasion
- Rules engine didn't change visible and disabled state on control, but instead directly modified DOM state.
- Fixed `trigger` action in rules engine.
- Fixed bug in PWA Router `route` method


# Older versions

See [Revisions Archive](./md/REVISIONS-archive.md)