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

