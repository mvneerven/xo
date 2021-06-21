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



## ExoForm Explorer 
[The ExoForm Explorer](https://www.xo-js.dev/#/explore) is loaded with new functionality to experiment with all the new features.

![Portal](https://xo-js.dev/assets/img/portal.png "The new ExoForm Explorer")

## Distributable

To use ExoForm 1.01, use the new JS versions at:

```
https://xo-js.dev/v1.0/xo.js
https://xo-js.dev/v1.0/xo.min.js
```

... or get the latest NPM package

https://www.npmjs.com/package/@mvneerven/xo-js


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
- containerClass removed. Use 'class' on schema fields to set class names. All classes are added to the containing div (div.exf-ctl-cnt)

# New in 1.1.0

CDN link: https://xo-js.dev/v1.1/xo.js

## Model Binding

You can now bind your ExoForm data to a model.

```json
{
  "model": {
    "instance": {
      "person": {
        "name": "Marc",
        "age": 57,
        "gender": "m"
      }
    }
  },
  "pages": [
    {
      "legend": "My Form",
      "intro": "My form description",
      "fields": [
        {
          "name": "testField1",
          "type": "text",
          "caption": "Name",
          "bind": "instance.person.name"
        },
        {
          "name": "testField2",
          "type": "number",
          "caption": "Age",
          "bind": "instance.person.age"
        },
        {
          "name": "testField3",
          "type": "dropdown",
          "caption": "Your age please, @person.name",
          "bind": "instance.person.gender",
          "items": [
            {
              "name": "Please choose",
              "value": ""
            },
            {
              "name": "Male",
              "value": "m"
            },
            {
              "name": "Female",
              "value": "f"
            },
            {
              "name": "Wish not to share",
              "value": "u"
            }
          ]
        }
      ]
    }
  ]
}
```

# New in 1.1.1

## Model Binding Extensions

### Logic 

You can now add a logic property in your forms to allow for dynamic behavior based on changes in the model.

```js
const schema = {
    model: {
        schemas: {
            person: "/data/json/schemas/person-schema.json"
        },
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
            const model = context.model, person = model.instance.person, b = model.bindings;
            b.genderUnknown = !['male', 'female'].includes(person.gender);
            b.title =
                (b.genderUnknown ? '' : (person.gender === 'male' ? 'Mr ' : 'Mrs '))
                + person.name.first + ' ' + person.name.last;
            b.under18 = model.instance.person.age <= 17;
            b.continue = !b.under18 && model.instance.contract.agree;
            b.info = 'agree to proceed'
        }
    },
    pages: [
        {
            legend: "Page 1",
            intro: "My form description",
            fields: [
                {
                    name: "name",
                    type: "name",
                    caption: "Your name",
                    bind: "instance.person.name"
                }, {
                    name: "age",
                    type: "number",
                    min: 16,
                    max: 110,
                    step: 1,
                    caption: "Your age",
                    bind: "instance.person.age"
                }, {
                    name: "gender",
                    type: "dropdown",
                    disabled: "@bindings.under18",
                    caption: "Gender",
                    items: [
                        {
                            name: "Please choose",
                            value: "unknown"
                        }, {
                            name: "Male",
                            value: "male"
                        }, {
                            name: "Female",
                            value: "female"
                        }, {
                            name: "Not important",
                            value: "unspecified"
                        }
                    ],
                    bind: "instance.person.gender"
                }, {
                    name: "agree",
                    type: "checkbox",
                    caption: "I have read the <a href='/terms'>terms & conditions</a> and agree to proceed",
                    tooltip: "Check to continue",
                    bind: "instance.contract.agree"
                }, {
                    name: "info",
                    visible: "@bindings.under18",
                    type: "dialog",
                    title: "Info",
                    body: "You have to be over 18 to continue",
                    bind: "instance.contract.info"
                }
            ]
        }, {
            legend: "Page 2",
            relevant: "@instance.contract.agree",
            fields: [
                {
                    name: "why",
                    type: "multiline",
                    caption: "@bindings.title, let us know what you think..."
                }, {
                    type: "checkboxlist",
                    name: "checkboxlist",
                    caption: "Checkboxlist",
                    items: [
                        "First", "Second"
                    ]
                }
            ]
        }
    ],
    form: {

    }
}
```

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

If you don't have a controls array in your schema, ExoForm will revert to the default behavior based on the selected *navigation* type. For instance, if your *navigation* setting is 'auto' (or not specified in the schema), and your schema consists of one page, the following code will be injected into the runtime schema:

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

# New in 1.2.8

## Simplified usage

There's now an extremely simple syntax to directly run a form.

```js
document.body.appendChild(await xo.form.run("/data/forms/mi.js"));
```

You still have access to most of the functionaliy:

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

... providing an ExoFormContext object:

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

## Changes

- Removed 
  - ExoWizardRouteModule (obsolete), 
  - ExoSchemaGenerator (to be replaced with a full fledged schema generator based on JSON Schemas)
  - ExoRouteModule (obsolete)
  

# New in 1.3.0

CDN link: https://xo-js.dev/v1.3/xo.js

## JSON Schema Support

Support for JSON Schema (V7) references in the model.

With this model:

```js
const schema = {
    model: {
        schemas: {
            assets: "/data/schemas/assets-schema.json"
        },
        instance: {
            assets: {
                id: "ea56912e-0f14-489e-af5f-3e4b7d0a966f",
                name: "Sunset.jpg",
                type: "image/jpeg",
                alt: "Sunset in the mist",
                size: 3874085,
                imageUri: "https://blobs.mydomain.com/assets/d3a7691266f.jpg",
                tags: ["sunset", "hills", "misty", "clouds"]
            }
        }
    }, [...]
``` 

... and the referenced JSON schema:

```json
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "type": "object",
    "properties": {
      "id": {
        "type": "string",
        "readOnly": true,
        "title": "Id"
      },
      "name": {
        "type": "string",
        "title": "Name"
      },
      "type": {
        "type": "string",
        "title": "File Type"
      },
      "alt": {
        "type": "string",
        "title": "Alt Text"
      },
      "size": {
        "type": "integer",
        "title": "File Size"
      },
      "imageUri": {
        "type": "string",
        "title": "Image"
      },
      "tags": {
        "type": "array",
        "title": "Tags"
      }

    },
    "required": [
      "id",
      "name",
      "type",
      "alt",
      "size",
      "imageUri",
      "tags"
    ]
  }
```

... your average ExoForm UI schema looks a lot simpler:

```js
pages: [
    {
        fields: [
            { bind: "instance.data.name" },
            { bind: "instance.data.type"}, 
            { bind: "instance.data.alt" },
            { bind: "instance.data.size"},
            { 
                bind: "instance.data.imageUri",
                disabled: true
            }, 
            { 
                bind: "instance.data.imageUri",
                caption: " " ,
                type: "image",
                style: "max-width: 400px"
            }, 
            {
                name: "tags",
                bind: "instance.data.tags",
                type: "tags"
            }
        ]
    }
]
```

... which will result in this form:

![Portal](https://xo-js.dev/assets/img/schema-form.png "The resulting form")

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

```


## PWA OmniBox

What is an OmniBox?

![OmniBox](https://xo-js.dev/assets/img/omnibox.png "An OmniBox")

OmniBox is a multi-faceted global contextual search autocomplete mechanism that is a great addition to any Progressive Web App/Single Page Application.

The OmniBox 'knows' the app routes, but also provides a flexible way for any component within the app to hook into the listings and provide custom search results with custom selection actions, using OmniBox categories.

In the case portrayed in the image, the OmniBox shows results in 4 categories, with both deep links to state inside the app, and external actions to be triggered.

The Google and Image categories simply link through to external applications, but the Help category has real understanding of a help system attached to the app (like ZenDesk for instance), and the Settings category is fed by using the settings ExoForm schema (which essentially is metadata that is to be translated into a web form), so it can deep link into a form field highlighted in a form.

However intuitive your app's UI is, for novice users of your app, OmniBox will help discover functionality. For power users, it will shorten the path to functionality hidden a few clicks away in the UI.


```js
 this.omniBox = new PWA.OmniBox({
      useRoutes: true,
      placeholder: "The start of everything...",
      tooltip: "Navigate through this app by clicking & typing here..",

      categories: {
          Google: {
              sortIndex: 500,
              trigger: options => { return options.search.length >= 2 },
              text: "Search on Google for '%search%'",
              getItems: options => {
                  return [{
                      text: "Search on Google for '%search%'"
                  }]
              },
              icon: "ti-search",
              action: options => {
                  options.url = `https://www.google.com/search?q=${options.search}`;
              },
              newTab: true
          },

          Images: {
              sortIndex: 600,
              trigger: options => { return options.search.length >= 2 },
              getItems: options => {
                  return [{
                      text: "Search images on Pexels for '%search%'"
                  }]
              },
              action: options => {
                  options.url = `https://www.pexels.com/search/${options.search}`;
              },
              newTab: true,
              text: "Search for '%search%' images",
              icon: "ti-image"
          },

          Products: {
              sortIndex: 100,
              trigger: options => { return options.search.length >= 2 },
              getItems: options => {
                  return [{
                      text: "Search products with term/tag '%search%'"
                  }]
              },
              text: "Search for '%search%' products",
              icon: "ti-package",
              action: options => {
                  document.location.hash = `/products/${options.search}`;
              }
          }
      }
  });

```

## Core.MarkDown

A [MarkdownIt](https://github.com/markdown-it/markdown-it) wrapper:

```js
let html = await Core.MarkDown.read("./README.md");
document.body.appendChild(DOM.parseHTML(html));
```

# New in 1.3.16

## ExoForm Schema

### New Property: mappings

With a JSON Schema in the lead, form generation is easier than ever.
The JSON Schema provides a lot of information that helps ExoForm in binding to a model.
What you need then is an intuitive way of mapping and customizing the UI for each control, given the rich possibilities ExoForm (and extensions) provide.

With *bindings*, you can reuse the property layout in a JSON Schema to specify any customizations per property:

Example:

```js
const schema = {
  navigation: "static",
  model: {
    schemas: {
        data: "/data/schemas/product-schema.json"
    },
    instance: {
        data: {
            id: "ea56912e-0f14-489e-af5f-3e4b7d0a966f",
            name: "Test Product",
            description: "Product description",
            price: {
                amount: 34.45,
                currency: 978
            },
            isForSale: true,
            vatPercentage: 9,
            imageUri: "https://cdn.domain.com/st6fvmyd/assets/img/testprod1.jpg",
            tags: ["sunset", "hills", "misty", "clouds"]
        }
    }
},

mappings: {
    skip: ["recordVersion"],

    pages: { 
        one: { legend: "Hello" },
        two: { legend: "Bye" }
    },

    properties: {
        id: {
            type: "hidden"
        },
        name: {
            autocomplete: { items: ["Good", "Bad", "Ugly"] }
        },
        imageUri: {
            page: "two",
            type: "image"
        },

        price: {
            class: "compact",
            fields: {
                amount: {
                    type: "number",
                    prefix: "€"
                }
            },
            columns: "6em 4em",
            areas: `"amount currency"`
        },
        tags: {
            type: "tags"
        },
        isForSale: {
            type: "switch"
        }
    }
}
```

## Misc
- xo.form.factory.readJSONSchema() method

# New in 1.3.17

- ExoDropdownButton update

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

## Make OmniBox aware of settings:

Let people find out where they can configure something by making the omnibox component aware of all settings:


![OmniBox](https://xo-js.dev/assets/img/omnibox-settings.png "An OmniBox")

In a router component:

```js
 get omniBoxCategories() {
    return {
        Settings: {

            trigger: options => { return options.search.length >= 2 },
            getItems: async options => {

                // return al, settings that match in name or title/caption
                return this.collectSettings().filter(i => {
                    let text = `${i.name} ${i.title}`.toLowerCase();
                    return text.indexOf(options.search) > -1;
                }).map(r => {
                    return {
                        text: "Settings/" + r.title,
                        description: "Go to settings",
                        field: r.name
                    }
                })
            },
            text: "Search for '%search%' products",
            icon: "ti-package",
            action: options => {
                document.location.hash = "/settings/" + options.field
            }

        }
    }
}

// get all settings from each route component
collectSettings() {
    let ar = [];

    pwa.router.modules.forEach(r => {
        if (!r.hidden) {
            if (r.module.settings) {
                ar = ar.concat(r.module.settings.settings);
            }
        }
    });

    return ar;
}
```

# New in 1.3.37

## Improvements

### OmniBox

- Each OmniBox category can have a *sortIndex* property, which specifies where the results within that category are shown in the list of results.

- OmniBox now fires an 'omnibox-init' event on the pwa object. This gives any component the chance to hook into the creation and add categories.

Add a 'Products' category:

```js
 pwa.on("omnibox-init", e => {
    e.detail.options.categories["Products"] = {
        sortIndex: 1,
        trigger: options => { return options.search.length >= 2 },
        getItems: async options => {
            return this.client.productApi.find(options.search, {max: 3}).map(i => {
              return {
                text: i.name,
                description: i.description
              }
            })
        },
        icon: "ti-package",
        action: options => {
            document.location.hash = '/products/' + options.text
        }

    }
});
```

- OmniBox categories can now be triggered depending on other results. Using the *sortIndex* property, you can specify that your category is only activated when other categories have already had the chance of adding their results, so that your data can be skipped if other results are already showm. This can be handy for 'catch all' categories such as delegating to an external help system.

In the case below, we're showing the option to search in ZenDesk, but only if there were no other results:

```js
pwa.on("omnibox-init", e => {
    e.detail.options.categories["Help"] = {
          sortIndex: 400,
          trigger: (options) => {
            return options.results.length === 0 && options.search.length >= 2;
          },
          getItems: (options) => {
            return [
              {
                text: `Search for help on '${options.search}'`,
              },
            ];
          },
          icon: "ti-help",
          action: (options) => {
            options.url = `https://help.mydomain.com/hc/nl/search?utf8=%E2%9C%93&query=${options.search}`;
          },
          newTab: true,
        }
    }
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

A versatile listview for grid and tile views.

```js
{
  type: "listview",
  name: "lv1",
  columns: [
    name: {
      autoWidth: true,
        type: "main"
      },
      imageUri: {
        autoWidth: true,
        type: "img"
      },
      description: {
        width: "2fr",
        class: "hide-sm"
      },
      type: {
        autoWidth: true,
        class: "hide-xs"
      },

      size: {
        autoWidth: true,
        class: "hide-xs"
      },
      tags: {
        autoWidth: true
      }
  ],
  items: [...]
}
```

Default ListView

![ListView in Grid Mode](https://xo-js.dev/assets/img/listview-grid.png "ListView in Grid Mode")

![ListView in Grid Mode](https://xo-js.dev/assets/img/listview-tiles.png "ListView in Grid Mode")

ContextMenu

![Context Menu](https://xo-js.dev/assets/img/listview-contextmenu.png "ListView with context menu")

```js
{
  type: "listview",
  name: "lv1",
  view: "tiles",
  columns: [
      ...
  ],
  items: [
      ...
  ],
  contextMenu: [
      {
          tooltip: "Edit",
          icon: "ti-pencil",
          action: "edit",
      },  
      {
          tooltip: "Delete",
          icon: "ti-close",
          action: "delete"
      }
  ]

}
```

