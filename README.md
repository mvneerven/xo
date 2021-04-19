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

# ExoForm Builder

To see what it does, how to use it and quickly build ExoForm schemas, we developed an online environment. 

See [the Explorer](https://www.xo-js.dev/#/explore)


# How it works

ExoForm is implemented as a set of ECMAScript classes.

See it at work on [CodePen](https://codepen.io/mvneerven/pen/XWpRREG):

Basic JavaScript:

```javascript const context = await window.xo.form.factory.build();
        const schema = {
            pages: [
                {
                    legend: "My Form",
                    fields: [
                        {
                            name: "name",
                            type: "text",
                            caption: "Your name",
                            placeholder: "Peter"
                        },
                        {
                            name: "email",
                            type: "email",
                            caption: "Your email adress",
                            placeholder: "john@doe.com",
                            value: "ma@pa.com"
                        },
                        {
                            name: "color",
                            type: "color",
                            caption: "Your preferred color",
                            value: "#ff5522"
                        },
                        {
                            name: "date",
                            type: "date",
                            caption: "Your birthdate"
                        },
                        {
                            name: "daterange",
                            type: "daterange",
                            caption: "Worked in period"
                        },

                        {
                            name: "cklist",
                            type: "checkboxlist",
                            caption: "Good or bad",
                            items: ["Good", "Bad", "Ugly"]
                        },
                        {
                            name: "address",
                            type: "nladdress",
                            caption: "Address"
                        },
                        {
                            name: "comments",
                            type: "multline",
                            caption: "Comments"
                        },
                        {
                            "name": "radiobuttonlistfield1",
                            "type": "radiobuttonlist",
                            "caption": "Radiobuttonlist",
                            "items": [
                                "First",
                                "Second",
                                "Third",
                                "Fourth"
                            ]
                        },
                        {
                            name: "role",
                            type: "dropdown",
                            caption: "Your role",
                            items: [
                                { value: "", name: "Please select..." },
                                "Architect",
                                "CEO",
                                "CTO",
                                "COO",
                                "Developer"
                            ]
                        }
                    ]
                }
            ]
        };

        const x = context.createForm();
        await x.load(schema)
        let result = await x.renderForm();
        document.body.appendChild(result.container);     
```

