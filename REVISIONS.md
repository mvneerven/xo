# XO-JS Revision History

This is a summary of the changes and additions in XO since version 1.0.

# New in 1.01

A big update to ExoForm, including a rewrite of navigation, progress indicating, validation and theming engines, all of which are now implemented as separate subclassable components, and activated using form schema settings (or using JavaScript code).

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


# New in 1.0.32

## Fixes
-	Step is now taken into account in the number control with 'buttons' property set to true
- Required fields' labels are suffixed with a '*' (using CSS ::after), based on the container class *exf-required*


## Additions

- When building an ExoFormContext object (using the factory method *ExoFormFactory.build()*, defaults for form settings can now be passed in:

```javascript
// set default validation to be 'inline' for all forms
const context = await window.xo.form.factory.build({
    defaults: {
        validation: "inline"
    }
});
```

See [Validation](./md/exo/validation.md)

## Changes:
-	Custom controls must now implement a value getter and setter, instead of setting functions on the field object

```javascript
set value(data){
  // custom logic
}

get value() {
  // custom logic
}
```

## ExoForm Portal

-	The current workspace is now saved, so if you're working on a form, it will be reloaded next time you open the Explorer.
-	The dark mode switch now immediately switches Ace Editor themes


# New in 1.0.33

## Changes
- containerClass removed. Use 'class' on schema fields to set class names. All classes are added to the containing div (div.exf-ctl-cnt), except when *useContainer* is false, such as in *button*.


## Model Binding

You can now bind your ExoForm data to a model.

See [Model Binding](./md/exo/data-binding.md)

## Support for JS schemes

You can now easily switch to JavaScript literal notation, which makes it easier to write logic (if you're a developer ;-).

![Portal](https://xo-js.dev/assets/img/js-schema.png "ExoForm Studio editing a JS schema")

In the upper right corner of the editor window, you can toggle between JS and JSON notation:

![Portal](https://xo-js.dev/assets/img/json-schema.png "Toggling to JSON schema")

# New in 1.1.2

## ESBuild used

No more Babel transpiling of ES6 Code. Just plain ES6, minified and bundled by [ESBuild](https://esbuild.github.io/).

# New in 1.2.0

CDN link: https://xo-js.dev/v1.2/xo.js

## Form controls in Schema

You can now specify a *controls* array in the ExoForm schema.

See [Navigation](./md/exo/navigation.md)

# New in 1.2.8

## Simplified usage

There's now an extremely simple syntax to directly run a form or render a single control, using xo.form.run().

See [Getting Started with ExoForm](./md/exo/getting-started.md)

## Changes

- Removed 
  - ExoWizardRouteModule (obsolete), 
  - ExoSchemaGenerator (to be replaced with a full fledged schema generator based on JSON Schemas)
  - ExoRouteModule (obsolete)
  

# New in 1.3.0

CDN link: https://xo-js.dev/v1.3/xo.js

## JSON Schema Support

Support for JSON Schema (V7) references in the model.

See [JSON Schema Support](./md/exo/json-schema.md)

# New in 1.3.5 

## Events 

### Binding to dom events using 'on'

Apart from handling ExoForm events using the 'on' property of the optuons provided in xo.form.run(), you can now also directly provide event handlers for DOM events in the rendered form:

```js
let container = await xo.form.run("/data/forms/account.json", {
    context: this.xoContext,
    on: {
        post: e=>{
          // handle post
        },
        page: e=>{
          // react on form paging
        },
        dom: {
          change: e => {
            // react to DOM change on rendered form element
          }
        }
    }
})
```

## Controls

- map -> Leaflet wrapper

# New in 1.3.6

- Generic tooltip property added on all controls



# New in 1.3.12

## Textbox Autocomplete

All textbox controls, including derived ones such as email, tel, url, now have a property *autocomplete*, which accepts an object with *items* and *categories*.

```js
{
    name: "autocomplete",
    type: "text",
    caption: "Autocomplete test",
    placeholder: "Start typing...",
    autocomplete: {
        items: ["", "okay", "bla"]
    }
}
```

## PWA OmniBox

See [OmniBox](./md/pwa/omnibox.md);

## Core.MarkDown

A [MarkdownIt](https://github.com/markdown-it/markdown-it) wrapper:

```js
let html = await Core.MarkDown.read("./README.md");
document.body.appendChild(DOM.parseHTML(html));
```

# New in 1.3.16

## ExoForm Schema

The *mappings* property for JSON Schema Bound forms.

See [JSON Schema](./md/exo/json-schema.md)


# New in 1.3.22 


## Router menu display

 *router.generateMenu()* now points to generic router menu generation 
  - *pwa.router.listModules()* is called to get loaded route module properties
  - *pwa.UI.createMenu()* creates an instance *PWA_RouterMenu* class
  - These routines can now be called separately to have full control.

```js
  const menu = pwa.UI.createMenu();
  let nav = menu.renderRouteMenu( m=>{
      return m.name !== "MySpecialRoute"
  });
```

# New in 1.3.24 

## OmniBox options

Apart from passing in *useRoutes: true* in the OmniBox options, you can now also use a function to filter routes to be included.

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


# New in 1.3.26

- dropdownbutton DEPRECATED: use button with 'dropdown' property instead of dropdownbutton. 

# New in 1.3.29

## Distributed Settings Handling

In a large scale SaaS product, many configuration settings will exist, with storage on several parts of the SaaS account, each module having a scope on what settings it needs, what scope  settings have and where it wants to read and write them.

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
 pwa.settings.add(this.settings)
  .on("read", e => {
      e.detail.instance.data = this.accountSettings
  })
  .on("write", e => {
      this.accountSettings = e.detail.instance.data
  });
```

### Textbox (and derived inputs - search, url, etc.)

The *prefix* property can now be an object that specifies font, size and/or icon:

```json
  {
    "type": "search",
    "prefix": {
       "char": "◷",
       "font": "Segoe UI"
    }
  }
```

... or

```json
  {
    "type": "search",
    "prefix": {
       "icon": "ti-search"
    }
  }
```

### List controls

Items in the *items* array in list controls can now have a *disabled* property.

```js
{
  name: "shoptype",
  type: "radiobuttonlist",
  view: "tiles",
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

# New in 1.3.38

## ListView Control (type: "listview")

See [ListView Control](./md/exo/controls/listview.md)

# New in 1.4.0

- XO Portal rewrite 
- week (input[type=week]) wrapper
- Listview improvements


# New in 1.4.2

- beforeDropdown event triggered when hovering buttons with dropdowns 
  - dropdownItems -> dropdown li collection
  - buttonControl -> button control instance
- beforeContextMenu event triggered when hovering contextmenu in listview
  - dropdownItems -> dropdown li collection
  - buttonControl -> button control instance
  - domItem: list item DOM lement the contextmenu is shown for
  - item: the item in the current dataset the contextmenu is shown for

