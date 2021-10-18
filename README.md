# XO-JS

> ## ▷ Docs
> This documentation is best viewed at [https://www.xo-js.dev](https://www.xo-js.dev/#/docs).
>
> A complete playground (Studio) is included and code examples can directly be run and edited.
 
XO-JS is a compact, developer-friendly, pure JavaScript (ES6) Component Library that helps with [Progressive Web App](./md/pwa/index.md) development and includes a [Declarative Web Forms Engine](./md/exo/index.md)


> - < 70KB minified and Brotli-compressed
> - No external dependencies
> - Vue, React, Angular, Vanilla JS supported

# Modules

1. [xo.form](./md/exo/index.md)
2. - [Why Declarative Webforms?](./md/exo/why.md)
   - [Getting Started](./md/exo/getting-started.md)
   - [XO Studio](./md/exo/studio.md) 
   - [Debugging](./md/exo/debugging-exoform.md)
   - [Controls](./md/exo/controls/index.md)
   - [Validation](./md/exo/validation.md)
   - [Navigation](./md/exo/navigation.md)
   - [Model Binding](./md/exo/data-binding.md)
   - [JSON-Schema](./md/exo/json-schema.md)

3. [xo.pwa](./md/pwa/index.md) 
   - [Getting Started](./md/pwa/getting-started.md)
   - [Router](./md/pwa/router.md)
   - [UI](./md/pwa/ui.md)

# Installing

## CDN

Use XO directly from the CDN:

```html
<script src="https://xo-js.dev/v1.4/xo.js"></script>
or...
<script src="https://xo-js.dev/v1.4/xo.min.js"></script>
```

## NPM
... or get the latest [NPM package](https://www.npmjs.com/package/@mvneerven/xo-js)

# Background

Large Enterprise, Multi-tenant SaaS apps are extremely configurable at all levels. Also, they need automated, self-service onboarding, in order to set the basics for a new tenant or user, manage user authorization, subscription management, and all data that the specific SaaS product needs to manage.

> Building complete front-ends in a bespoke way is a tedious, error-prone and costly undertaking.

Also, each of these developments adds overhead in terms of testing and deployment.

Lastly, maintaining consistence over all front-end facing application parts is not a small task.

## How does XO-JS solve this problem?

A way to solve all these issues at once, and speed up delivery of countless new front-end data-collecting requirements, is to have a highly flexible Forms Generator that can be fed declarative form schema data and automatically render forms.

Examples of this type of product are XForms generators, Wufoo, TypeForm, JotForms and others. 

Why develop a new one, then? 

> Well, because I've seen what developers need. They need to save as much time as needed, yet have all the power to themselves.

What does XO-JS bring?

* XO-JS gives developers complete freedom: simply include it in your development stack, and bypass, subclass, add anything you want. 
* No bulky dependencies. HTML5, CSS3, ECMAScript. That's it. They're powerful enough ;-) 
* Use it in any environment, [Vue](https://codepen.io/mvneerven/pen/GRWbvqp), React, Angular, or plain vanilla JavaScript. 
* [Create and include your own XO-JS control libraries](./md/exo/controls/building-controls.md). 
* Customize anything: styling, validation, navigation, progress indication, etc. 
* Get typed JSON post data 
* [All HTML5 controls](./md/exo/controls/index.md) included, plus a large number of custom controls
* Ace Code Editor, CkEditor wysiwyg editor (richt text) 
* Examples of adding your own controls at codepen.io. For example, use the [Monaco Editor](https://codepen.io/mvneerven/pen/NWdYybz).
* [Autocompletion](./md/exo/controls/textcontrol.md) extension on text controls
* Standard HTML5 & Inline [validation](./md/exo/controls/../validation.md) (or roll your own)
* Wizards & other multi-page forms, Surveys, Tabstrip-type forms, etc. (see [Navigation](./md/exo/navigation.md))
* Completely overridable rendering & theming
* A visual [XO-JS Studio](https://www.xo-js.dev/#/studio) and Test Environment
  * Code Editor with JSON/JS support
  * Wysiwyg designer (in development) 
  * Jest test environment 
* [Codepen examples](https://codepen.io/collection/XLwaxp)
* Etc. 



# Team

Author: [Marc van Neerven](https://www.linkedin.com/in/mvneerven/)

Contributors:
- [Inbar Azulay](https://www.linkedin.com/in/inbar-azulay/)


# Revision History

[Full revision history](./REVISIONS.md)

# Reference Documentation

[XO-JS Reference Documentation](./md/refdocs/toc.md)