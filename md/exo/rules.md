# Model Based Rule Engine

The XO form rules engine is model based. This means rules apply when data in your model changes.

Look at the example below: the email field is disabled until the user checks a checkbox.

Specifically, if the ```receive``` boolean property within the ```data``` instance in the model changes, the ```enable``` action is called with the result of the expression.

```js
const schema = {
  model: {
    instance: {
      data: {
        receive: false,
        email: "yama@moto.jp"
      }
    }
  },
  pages: [
    {
      legend: "Newsletter",
      fields: [
        {
          type: "checkbox",
          caption: "I want to receive the newsletter",
          bind: "#/data/receive"
        },
        {
          caption: "Email address",
          placeholder: "john@doe.com",
          bind: "#/data/email",
          type: "email",
          prefix: {
            icon: "ti-email"
          },
          actions: [
            {
              do: {
                enable: [
                  "#/data/receive"
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### Rules Anatomy

Each ```field``` and each ```page``` node can have a ```actions``` array, and each rule can have a ```if``` node and a ```do``` property:

```js
actions: [
  {
    [if: {
      [property: "",]
      <matchingparam>: <matchingvalues>
    },]
    do: {
      <action>: [<parameter1>[, <parameter2>, ...]]
    }
  }
]
```

In the Newsletter example above, the ```if``` clause is missing, which makes the given action trigger at every change of the given property in the model.

### The ```do``` node

Under the ```do``` node, one or more actions can be placed

- ```goto``` - jump to wizard page given in first parameter using index or page id (eg: ```goto: "mypage"```)
- ```dialog``` - open given dialog (eg: ```dialog: ["my-dialog"]```)
- ```set``` - set state in model 
- ```navigate``` - navigate to given URL
- ```convert``` - convert variable 
- ```sequence``` - bundle multiple actions into an array and execute them
- ```sum```
- ```focus``` - set focus to given control
- ```subtract```
- ```divide```
- ```multiply```
- ```modulus```
- ```power```

### The ```if``` node

Each ```if``` node can have a ```property``` property that works just like the ```bind``` property, pointing to a model instance node or property, and a *comparison* property.

If ```property``` is not set, the ```bind``` scope is used.

If ```if``` is not set, the rule fires on all changes in the given or implicit scope.

In the example below, the ```if``` clause is omitted, causing all input to be converted to upper case:

```js
const schema = {
  model: {
    instance: {
      data: {
        name: "abcde"
      }
    }
  },
  pages: [
    {
      fields: [
        {
          bind: "#/data/name",
          type: "text",
          caption: "Test conversion to upper case",
          actions: [
            {
              do: {
                convert: [
                  "#/data/name",
                  "upp"
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### Compare properties

If a ```test``` node exists, one of the following compare properties must exist underneath it:

- ```is``` equals
- ```not``` not equals
- ```gt``` greater than
- ```gte``` greater than or equals
- ```lt``` less than
- ```lte``` less than or equals
- ```in``` value in array
- ```match``` value matches given regular expression


## Extending the Rules Engine

As with many aspects of the XO platform, you can extend the Rules Engine with your own actions and operators.

In the case shown below, ```toLiquorStore``` is a custom action that is called in the XO form schema. In the options passed to ```xo.form.run()```, the ```toLiquorStore``` action is declared.
The ```over18``` operator is also declared in the ```operators``` options.

```js
const schema = {
    model: {
        instance: {
            state: {
                legal: false,
            },
            data: {
                name: "Marc",
                date: "",
                isChecked: false
            }
        }
    },
    pages: [
        {
            legend: "Continue to liquor store",
            fields: [
                {
                    type: "date",
                    bind: "#/data/date",
                    caption: "Enter your birthday",
                    actions: [
                        {
                            if: {
                                over18: true
                            },
                            do: {
                                set: ["#/state/legal", true]
                            },
                            else: {
                                set: ["#/state/legal", false]
                            }
                        }
                    ]
                },
                {
                    type: "checkbox",
                    caption: "I confirm that I'm over 18",
                    bind: "#/data/isChecked",
                    actions: [
                        {
                            do: {
                                enable: ["#/state/legal"]
                            }
                        },
                        {
                            if: {
                                is: true
                            },
                            do: {
                                toLiquorStore: []
                            }
                        }
                    ]
                }
            ]
        }
    ]
}

let fr = await xo.form.run(schema, {
    on: {
        ruleContextReady: e => {
            this.ruleContext = e.detail.context
        }
    },
    rules: {
        actions: {
            toLiquorStore: (a, b) => {
                document.location.href = "https://en.wikipedia.org/wiki/Liquor_store"
            }
        },
        operators: {
            over18: (a, b) => {
                b = this.ruleContext.var(b);
                let age = xo.core.calcAge(b);
                if (!isNaN(age))
                    return age >= 18 === a;
            }
        }
    }
});

this.app.UI.areas.main.add(fr)
```

### Adding custom actions and operators to the XO Form Context

Instead of adding custom actions and operators to every form's execution time, you can add defaults for the options passed to each form ```xo.form.run()``` when creating the xo form context.

This makes sense if you're creating more generic actions and operators.

```js
// place this code in the initialization of your SPA app
const context = await xo.form.factory.build({
    defaults: {
        validation: "inline"                
    },
    runOptions: {
        rules: {
            actions: {
                myCustomAction: a => {
                    alert(a)
                }
            }
        }
    }
});
```

In the example above, the Rules Engine is being instructed that, apart from the internal actions the XO Rules Engine provides, a ```myCustomAction``` action exists, and all forms that are run (using this context) can use it.

Just don't forget to pass the context created to the form runner:

```js
let fr = await xo.form.run(schema, {
    context: context
});
```

> The ```xo.form.factory.build()``` method is central to most extensibility in XO, including adding custom controls to the internal control library, defining custom validation, navigation, progress indication and more.

## Buttons & Actions

With the Rules Engine working on the basis of model changes, how then would we work with buttons?

Obviously, we can set up a ```bind``` and then add a value property:

```js
{
  type: "button",
  bind: "#/state/sendbtn",
  value: "clicked",
  name: "sendmsg",
  caption: "Send my message",
  class: "exf-lg",
  actions: [
    {
      if: {
        is: "clicked"
      }
      do: {
        alert: [ "Clicked" ]
      }
    }
  ]
}
```

However, that is a lot of extra work.
Luckily, the XO Rules Engine has *implicit binding* for buttons. 

If we have a button that has ```actions``` attached, and no value and bind properties, XO adds a binding to a special instance, *btnstates*, so that you can simply add a conditionless action:

```js
{
  type: "button",
  caption: "Send my message",
  actions: [
    {
      do: {
        alert: [ "Clicked" ]
      }
    }
  ]
}
```

Open the *Model* tab in XO Studio to see the implicit binding at work:

![Portal](https://xo-js.dev/assets/img/implicit-model.png "XO Studio editing a JS schema")

> The ```action``` property on the ```button``` control is deprecated since we now have the much more generic ```actions```.