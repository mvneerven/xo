# The Problem

Large Enterprise, Multi-tenant SaaS apps are extremely configurable at all levels. Also, they need automated, self-service onboarding, in order to set the basics for a new tenant or user, manage user authorization, subscription management, and all data that the specific SaaS product needs to manage.

> Building complete front-ends in a bespoke way is a tedious, error-prone and costly undertaking.

Also, each of these developments adds overhead in terms of testing and deployment.

Lastly, maintaining consistence over all front-end facing application parts is not a small task.

# How does ExoForm solve this problem?

A way to solve all these issues at once, and speed up delivery of countless new front-end data-collecting requirements, is to have a highly flexible Forms Generator that can be fed declarative form schema data and automatically render forms.

Examples of this type of product are XForms generators, Wufoo, TypeForm, JotForms and others. 

Why develop a new one, then? 

* ExoForm gives developers complete freedom: simply include it in your development stack, and bypass, subclass, add anything you want. 
* No bulky dependencies. HTML5, CSS3, EcmaScript. That's it.
* Use it in any environment, Vue, React, Angular, or plain vanilla JavaScript. 
* Create and include your own control libraries. 
* Get typed JSON post data 
* All HTML5 controls included
* Ace code editor, Monaco Editor 
* CkEditor wysiwyg editor (richt text) 
* Autocompletion
* HTML5 validation 
* Wizards 
* Surveys, 
* CSS3 grid system 
* Semantic HTML 
* Completely overridable rendering 
* JSON Schema editor 
* Wysiwyg designer (in development) 
* Jest test environment 
* Codepen examples 
* Etc. 

![88e4b200-098b-428f-a397-c46488cef315.png](https://files.nuclino.com/files/a72207fa-92f5-425d-b5af-754d3ee5ebd6/88e4b200-098b-428f-a397-c46488cef315.png)

# ExoForm Builder

To see what it does, how to use it and quickly build ExoForm schemas, we developed an online environment. 

See [ASF PWA](https://stasfpwawesteu.z6.web.core.windows.net/#/explore)

![16ed325c-ca1b-40a7-a107-18c29b57e1e5.png](https://files.nuclino.com/files/ceab1de5-6d36-4fb5-bd3d-c0e8c3c95643/16ed325c-ca1b-40a7-a107-18c29b57e1e5.png)

# How it works

ExoForm is implemented as a set of ECMAScript classes.

See it at work on [CodePen](https://codepen.io/mvneerven/pen/bGBzxJp):



[https://codepen.io/mvneerven/pen/bGBzxJp](https://codepen.io/mvneerven/pen/bGBzxJp)

Basic JavaScript:

```javascript
// beta lib location 

import * as xo from "https://xo-js.dev/v0.98/xo.min.js";

const context = await window.xo.form.factory.build();

context
  .createForm()
  .load(schema)
  .then(x => {
    x.renderForm().then(x => {}) 
 });
     
```

# More Info

[See ExoForm documentation](https://app.nuclino.com/Twelve-eu/ExoForm) (open in new window/tab)
