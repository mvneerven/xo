This is an archive of the changes and additions in XO since version 1.0.

> For the latest revisions, see [Revisions](../REVISIONS.md)


# New in 1.4.132

- Generic `css` property (all controls)

# New in 1.4.130

## Sandbox: using subforms.

The new `sandbox` control allows you to embed subforms in an isolated way, using an `iframe` tag.
All communication between main form and subform is done using `postMessage`.

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
          name: "testField",
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
                      name: "cc",
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

## `textconfirm` control added

This text control fires a change event only when confirmed using a confirmation button (or pressing enter)

## `imageselector` control added

This control uses autocompletion to find and select an image and shows a preview of the selected image.

## Other

- xo.isDebug
- xo.path
- `remark` property added to all controls for general commenting
- `break` property added to all controls, to force debug break in rendering of a control
- `listview` control `tilewidth` property added


# New in 1.4.116

## Listview Control

Listview now has `checkboxes` property to set behavior to use checkboxes for selection. Clicking an item in the listview will trigger the first action in the contextmenu, if any.

## Autocomplete images

Autocomplete feature on textboxes now allows for images to be displayed. Use `image: "/image-path"` to use them in the items returned.

## Dialog as sidepanel

The dialog control now supports a `mode` parameter to switch to sidepanel behavior.

```js
const schema = {
  model: {
    logic: (context) => {
      if (context.changed.property === "button") {
        // e.changed.newValue
      }
    },
    instance: {
      control: {
        button: "",
      },
    },
  },
  pages: [
    {
      fields: [
        {
          type: "button",
          name: "show",
          caption: "Show dialog! @instance.control.button",
          action: "dialog:dlg1",
        },
        {
          name: "dlg1",
          body: "Test dialog!",
          caption: "Test Field",
          type: "dialog",
          mode: "side",
          bind: "instance.control.button",
        },
      ],
    },
  ],
};
```


# New in 1.4.110

- `columns` property in list controls (checkboxlist, radionuttonlist), which makes long option lists flow in multiple columns.


# New in 1.4.100

- You can now link a model instance via a URL instead of declaring it inline
- Listview control now has a static mode, in which it just renders the data but adds no interactivity
- Clicking on a selected item in a singleSelect Listview doesn't deselect the item (unless CTRL is pressed)


# New in 1.4.92

## LiveEdit in XO Studio

You can now edit forms in place in XO Studio:

![Portal](https://xo-js.dev/assets/img/live-editor.png "Toggling to JSON schema")

The Live Edit feature supports drag & drop sorting, deleting fields and editing fields using property sheets. This feature leverages the fact that each control now exposes its own XO schema as a property and exposes metadata in the form of JSON Schema, which the property sheet uses to automatically generate an editing form - in XO!

# New in 1.4.88

- New control: `starrating`
- Fixed `range` control databinding


# New in 1.4.83

## New navigation type: `tabstrip`

See [navigation](./md/exo/navigation.md)


# New in 1.4.78

New actions for [button control](./md/exo/controls/buttoncontrol.md)


# New in 1.4.76

## Dialog showing & binding

You can now trigger showing a dialog from a button directly, using `action: "dialog:<name>"`.

Also, a dialog now can behave like any other form control in that its value is the button the user selects, it sends a change event when the user does, and the value can be bound to a model.

In the example below, we use all these features:

```js
const schema = {
  model: {
    logic: (e) => {
      if (e.changed.property === "button") {
        // e.changed.newValue
      }
    },
    instance: {
      control: {
        button: null,
      },
    },
  },
  pages: [
    {
      fields: [
        {
          type: "button",
          name: "show",
          caption: "Show dialog!",
          action: "dialog:dlg1",
        },
        {
          name: "dlg1",
          body: "Test dialog!",
          caption: "Test Field",
          type: "dialog",
          bind: "instance.control.button",
        },
      ],
    },
  ],
};
```

> UPDATE: `action` is now deprecated - see actions in 1.5.0 [Rules Engine](./md/exo/rules.md)


# New in 1.4.73

## Automcomplete improvements

See [Textbox](./md/exo/controls/textcontrol.md)

## Fixes

- Fixed logic runninmg inside JSON declared forms (worked in JS declared forms)



# New in 1.4.68

## New method: xo.form.from()

You can now use `xo.form.from(htmlElement)` to get access to the XO form instance controlling it.

You can pass it any element within an XO form container, including the container itself:

```js
const form = document.querySelector("form.exf-form");
const exo = xo.form.from(form);
```

## New method: xo.form.data()

In scenarios where XO form model data is shared with reactive environments such as Vue, react, Angular or Svelte (or just plain Vanilla JS), there is now an extremely simple way to get a reference to an XO form controlled model data instance.

For instance, you can use this code anywhere in your page:

```js
let sharedData = xo.form.data("person-form", "data", (o) => (sharedData = o));
```

... if you bind your form using a JSON Schema:

```js
const schema = {
  model: {
    schema: "https://myserver.com/json-schema/person.json",
  },
};

xo.form.run(schema, {
  id: "person-form",
});
```

If, instead of binding to a single named instance, you want a reference to the instance root node in an XO form model, just omit the `instanceName` parameter:

```js
let sharedData = xo.form.data("person-form", (o) => (sharedData = o));
```

The `sharedData` variable will then be a direct reference to the instance inside the form, and reactivity will be both ways as you wish.

> See [an example using Vue](https://github.com/inbarazulay1997/xo-examples/tree/main/vue.js).

## TreeView control

The TreeView control can be used to display hierarchical data structures.

```js
const schema = {
  model: {
    instance: {
      data: {
        selectedNodes: null,
      },
    },
  },
  pages: [
    {
      legend: "My Form",
      intro: "Selected: @instance.data.selectedNodes",
      fields: [
        {
          type: "treeview",
          name: "treeview",
          bind: "#/data/selectedNodes",
          singleSelect: false,
          minimum: 2,
          caption: "Treeview!!",
          mappings: {
            title: "name",
            tooltip: "description",
            id: "nr",
          },
          items: "/data/treedata.json",
        },
      ],
    },
  ],
};
xo.form.run(schema);
```

... where treedata.json has the following structure:

```json
{
  "nr": 0,
  "name": "Tree Structure",
  "children": [
    {
      "nr": 1,
      "name": "Child with nesting",
      "children": [
        {
          "nr": 2,
          "name": "Deep nesting"
        }
      ]
    },
    {
      "nr": 3,
      "name": "Second child"
    },
    {
      "nr": 4,
      "name": "Third child"
    }
  ]
}
```

The `items` property accepts both a URL and an inline object defining the tree structure.

## XO Studio Improvements

- Revamped Starter Wizard
- Generate a Form from a JSON Schema file/url
- Included autogenerated XO-JS reference documents in the [documentation](https://www.xo-js.dev/#/docs)



# New in 1.4.59

## Simplified Model Sharing for reactive frameworks (two-way model binding).

XO now has a simple way to share model data with your reactive framework (Vue, Angular, React, Svelte, etc.).

Simply pass a function to `xo.form.bind()` and wait for the state property to be `ready`. You can then get the instance as mounted in XO and read from and write to it.

```js
let sharedData = null;

xo.form.bind((e) => {
  if (e.state === "ready" && e.instances.data) sharedData = e.instances.data;
}, true); // bind to all data model events, with verbose=true
```

The `verbose` parameter can be used to watch all binding events in the console.

## DOMChange option

You can now specify the `DOMChange` event name XO will use to signal changes.

```js
await xo.form.run(schema, {
  DOMChange: "change",
});
```

You can also provide a default in your `ExoFormContext` instance"

```js
async createContext(config) {
  const factory = xo.form.factory;

  factory.add(MyControlLib.controls);

  return factory.build({
    defaults: {
      validation: "inline",
      DOMChange: "change"
    },
    ...(config || {}),
  });
}
```

XO now defaults to `input` to allow for a more realtime feel.



# New in 1.4.56

## Button control enhancements

See [Button Control](./md/exo/controls/buttoncontrol.md)

### Dropdown parameters alignment

You can now use caption, icon, class and action.

Dropdown action and click parameters now aligns with button action and click.

See above example.


# New in 1.4.5

## Model binding proxies

Model instances are now wrapped in ECMAScript _Proxy_ objects, so object state can be monitored, and state can be shared with hosting environments such as Vue, React or Angular.

Sharing data

You can now add an id to your form instance:

```js
let form = await xo.form.run(schema, {
  id: "my-form",
});
```

Using the events XO now emits, you can then hook into the form runtime:

```js
let data = null;
xo.on("new-form", (e) => {
  if (e.detail.id === "my-form") {
    e.detail.exoForm.on("schemaLoaded", (ev) => {
      const exo = ev.detail.host;
      const model = exo.dataBinding.model;
      // set data to the instance managed within the form
      data = model.instance.data;
    });
  }
});
```

## Other changes

- Better error handling
- xo.on() - xo now triggers events:
  - "new-form" event raised when a new form is created



# New in 1.4.0

- XO Portal rewrite
- week (input[type=week]) wrapper
- Listview improvements



# New in 1.3.38

## ListView Control (type: "listview")

See [ListView Control](./md/exo/controls/listview-control.md)



# New in 1.3.29

## Distributed Settings Handling

In a large scale SaaS product, many configuration settings will exist, with storage on several parts of the SaaS account, each module having a scope on what settings it needs, what scope settings have and where it wants to read and write them.

For end-users, it doesn't matter. The user simply wants to use the settings to configure the SaaS system as he/she likes, preferably in an intuitive way, and preferably in one central location: settings.

## Enter PWA.Settings

In any compomnent:

Declare a group of settings

```js
get settings() {
    return pwa.settings.createGroup("Account",
        {
            type: "string",
            name: "name",
            title: "Your name"
        },
        {
            type: "string",
            name: "email",
            format: "email",
            title: "Email address"
        }
    );
}
```

... then add them to the PWA's settings container:

```js
pwa.settings
  .add(this.settings)
  .on("read", (e) => {
    e.detail.instance.data = this.accountSettings;
  })
  .on("write", (e) => {
    this.accountSettings = e.detail.instance.data;
  });
```

### Textbox (and derived inputs - search, url, etc.)

See [TextBox Control](./md/exo/controls/textcontrol.md)

### List controls

Items in the _items_ array in list controls can now have a _disabled_ property.

```js
{
  name: "shoptype",
  type: "radiobuttonlist",
  required: true,
  caption: "Pricing Tiers",
  items: [
    {
      value: "starter",
      name: "Starter",
      description: "unavailable",
      disabled: true
    },
    {
      value: "standard",
      name: "Standard",
      checked: true,
      description: "free"
    },
    {
      value: "professional",
      name: "Professional",
      description: "unavailable",
      disabled: true
    }
  ]
}
```


# New in 1.3.26

- dropdownbutton DEPRECATED: use button with 'dropdown' property instead of dropdownbutton.



# New in 1.3.24

## OmniBox options

Apart from passing in _useRoutes: true_ in the OmniBox options, you can now also use a function to filter routes to be included.

```js
this.omniBox = new PWA.OmniBox({
      useRoutes: i => {
        return this.routeValid(i.module)
      },
      categories: {
        ...
      }
});
```


# New in 1.3.22

## Router menu display

_router.generateMenu()_ now points to generic router menu generation

- _pwa.router.listModules()_ is called to get loaded route module properties
- _pwa.UI.createMenu()_ creates an instance _PWA_RouterMenu_ class
- These routines can now be called separately to have full control.

```js
const menu = pwa.UI.createMenu();
let nav = menu.renderRouteMenu((m) => {
  return m.name !== "MySpecialRoute";
});
```




# New in 1.3.16

## XO form Schema

The _mappings_ property for JSON Schema Bound forms.

See [JSON Schema](./md/exo/json-schema.md)


# New in 1.3.12

## Textbox Autocomplete

See [Textbox](./md/exo/controls/textcontrol.md)

## PWA OmniBox

See [OmniBox](./md/pwa/omnibox.md);

## Core.MarkDown

A [MarkdownIt](https://github.com/markdown-it/markdown-it) wrapper:

```js
let html = await Core.MarkDown.read("./README.md");
document.body.appendChild(DOM.parseHTML(html));
```



# New in 1.3.6

- Generic tooltip property added on all controls


# New in 1.3.5

## Events

### Binding to dom events using 'on'

Apart from handling XO form events using the 'on' property of the optuons provided in xo.form.run(), you can now also directly provide event handlers for DOM events in the rendered form:

```js
let container = await xo.form.run("/data/forms/account.json", {
  context: this.xoContext,
  on: {
    post: (e) => {
      // handle post
    },
    page: (e) => {
      // react on form paging
    },
    dom: {
      change: (e) => {
        // react to DOM change on rendered form element
      },
    },
  },
});
```

## Controls

- map -> Leaflet wrapper



# New in 1.3.0

CDN link: https://xo-js.dev/v1.3/xo.js

## JSON Schema Support

Support for JSON Schema (V7) references in the model.

See [JSON Schema Support](./md/exo/json-schema.md)



# New in 1.2.8

## Simplified usage

There's now an extremely simple syntax to directly run a form or render a single control, using xo.form.run().

See [Getting Started with XO forms](./md/exo/getting-started.md)

## Changes

- Removed
  - ExoWizardRouteModule (obsolete),
  - ExoSchemaGenerator (to be replaced with a full fledged schema generator based on JSON Schemas)
  - ExoRouteModule (obsolete)



# New in 1.2.0

CDN link: https://xo-js.dev/v1.2/xo.js

## Form controls in Schema

You can now specify a _controls_ array in the XO form schema.

See [Navigation](./md/exo/navigation.md)



# New in 1.1.2

## ESBuild used

No more Babel transpiling of ES6 Code. Just plain ES6, minified and bundled by [ESBuild](https://esbuild.github.io/).



# New in 1.0.33

## Changes

- containerClass removed. Use 'class' on schema fields to set class names. All classes are added to the containing div (div.exf-ctl-cnt), except when _useContainer_ is false, such as in _button_.

## Model Binding

You can now bind your XO data to a model.

See [Model Binding](./md/exo/data-binding.md)

## Support for JS schemes

You can now easily switch to JavaScript literal notation, which makes it easier to write logic (if you're a developer ;-).

![Portal](https://xo-js.dev/assets/img/js-schema.png "XO Studio editing a JS schema")

In the upper right corner of the editor window, you can toggle between JS and JSON notation:

![Portal](https://xo-js.dev/assets/img/json-schema.png "Toggling to JSON schema")



# New in 1.0.32

## Fixes

- Step is now taken into account in the number control with 'buttons' property set to true
- Required fields' labels are suffixed with a '*' (using CSS ::after), based on the container class *exf-required\*

## Additions

- When building an ExoFormContext object (using the factory method _ExoFormFactory.build()_, defaults for form settings can now be passed in:

```javascript
// set default validation to be 'inline' for all forms
const context = await xo.form.factory.build({
  defaults: {
    validation: "inline",
  },
});
```

See [Validation](./md/exo/validation.md)

## Changes:

- Custom controls must now implement a value getter and setter, instead of setting functions on the field object

```javascript
set value(data){
  // custom logic
}

get value() {
  // custom logic
}
```

## XO Portal

- The current workspace is now saved, so if you're working on a form, it will be reloaded next time you open the Explorer.
- The dark mode switch now immediately switches Ace Editor themes


# New in 1.01

A big update to XO-JS, including a rewrite of navigation, progress indicating, validation and theming engines, all of which are now implemented as separate subclassable components, and activated using form schema settings (or using JavaScript code).

Also, a complete new theme has been added: material.

## Validation

Show inline validation messages to be shown instead of the default HTML5 validation popups.

```json
{
  "validation": "inline"
}
```

See [Validation](./md/exo/validation.md)

## Progress

Show the progress within a multi-page form.

```json
{
  "progress": "steps"
}
```

![Steps](https://xo-js.dev/assets/img/progress-steps.png?raw=true "Adding step indicator using progress='steps'")

## Material Theme

A new theme, inspired by Material Design, was added.

```json
{
  "theme": "material"
}
```

![Material Theme](https://xo-js.dev/assets/img/theme-material.png?raw=true "Setting theme to 'material'")

## Control Additions

### Multiline: autogrow (Boolean)

Let a textarea grow automatically when the user adds more lines.

```json
{
  "pages": [
    {
      "legend": "My Form",
      "intro": "My form description",
      "fields": [
        {
          "name": "testField",
          "caption": "Autogrowing Textarea",
          "type": "multiline",
          "autogrow": true
        }
      ]
    }
  ]
}
```

### Range: showoutput (Boolean)

Show the value of a range control

```json
{
  "pages": [
    {
      "legend": "My Form",
      "intro": "My form description",
      "fields": [
        {
          "name": "range",
          "caption": "Range Indicator",
          "type": "range",
          "showoutput": true
        }
      ]
    }
  ]
}
```

### Captcha: invisible (Boolean)

Make the Google ReCaptcha control act invisibly.

```json
{
  "pages": [
    {
      "legend": "My Form",
      "intro": "My form description",
      "fields": [
        {
          "name": "captch",
          "type": "captcha",
          "invisible": true
        }
      ]
    }
  ]
}
```
