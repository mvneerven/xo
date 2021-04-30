# The Problem

Large Enterprise, Multi-tenant SaaS apps are extremely configurable at all levels. Also, they need automated, self-service onboarding, in order to set the basics for a new tenant or user, manage user authorization, subscription management, and all data that the specific SaaS product needs to manage.

> Building complete front-ends in a bespoke way is a tedious, error-prone and costly undertaking.

Also, each of these developments adds overhead in terms of testing and deployment.

Lastly, maintaining consistence over all front-end facing application parts is not a small task.

# How does ExoForm solve this problem?

A way to solve all these issues at once, and speed up delivery of countless new front-end data-collecting requirements, is to have a highly flexible Forms Generator that can be fed declarative form schema data and automatically render forms.

Examples of this type of product are XForms generators, Wufoo, TypeForm, JotForms and others. 

Why develop a new one, then? 

> Well, because I've seen what developers need. They need to save as much time as needed, yet have all the power to themselves.

What does ExoForm bring?

* ExoForm gives developers complete freedom: simply include it in your development stack, and bypass, subclass, add anything you want. 
* No bulky dependencies. HTML5, CSS3, ECMAScript. That's it. They're powerful enough ;-) 
* Use it in any environment, Vue, React, Angular, or plain vanilla JavaScript. 
* Create and include your own control libraries. 
* Customize anything: validation, 
* Get typed JSON post data 
* All HTML5 controls included, plus a large number of custom controls
* Ace Code Editor, CkEditor wysiwyg editor (richt text) 
* Examples of adding your own controls at codepen.io. For example, use the [Monaco Editor](https://codepen.io/mvneerven/pen/NWdYybz).
* Autocompletion (using standard HTML5 DataLists, fixed lists, or dynamic API searches)
* Standard HTML5 & Inline validation (or roll your own)
* Wizards & other multi-page forms, Surveys, 
* Completely overridable rendering & theming
* A visual [ExoForm Explorer](https://www.xo-js.dev/#/explore) and Test Environment
  * JSON Schema editor 
  * Wysiwyg designer (in development) 
  * Jest test environment 
* [Codepen examples](https://codepen.io/collection/XLwaxp)
* Etc. 

# Using ExoForm in JavaScript

Basic JavaScript Flow:

```javascript 
const context = await window.xo.form.factory.build();
const x = context.createForm();
await x.load("/forms/myform.json");
let result = await x.renderForm();
document.body.appendChild(result.container);     
```

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

![Steps](img/md/progress-steps.png?raw=true "Adding step indicator using progress='steps'")

## Material Theme
A new theme, inspired by Material Design, was added.

```json
{
  "theme": "material"
}
```
![Material Theme](img/md/theme-material.png?raw=true "Setting theme to 'material'")

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

## ExoForm Explorer 
[The ExoForm Explorer](https://www.xo-js.dev/#/explore) is loaded with new functionality to experiment with all the new features.

![Portal](img/md/portal.png "The new ExoForm Explorer")

## Distributable

To use ExoForm 1.01, use the new JS versions at:

```
https://xo-js.dev/v1.0/xo.js
https://xo-js.dev/v1.0/xo.min.js
```

... or get the latest NPM package

https://www.npmjs.com/package/@mvneerven/xo-js
