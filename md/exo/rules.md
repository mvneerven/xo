# Model Based Rule Engine

The XO form rules engine is model based. This means rules apply when data in your model changes.

Look at the example below: the email field is disabled until the user checks a checkbox.

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
          rules: [
            {
              state: "enabled",
              condition: {
                scope: "#/data/receive",
                test: {
                  is: true
                }
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

Each ```field``` and each ```page``` node can have a ```rules``` array, and each rule has a ```condition``` node and either a ```state``` or an ```action``` property.

### The state property

- ```visible``` sets the visibility of the field to the result of the condition test
- ```enabled``` sets the enabled state of the field to the result of the condition test

### The action property

- ```goto``` - jump to wizard page given in first parameter using index or page id (eg: ```goto: "mypage"```)
- ```dialog``` - open given dialog (eg: ```dialog: ["my-dialog"]```)
- ```set``` - set state in model when condition is met
- ```convert``` - convert variable 
- ```sequence``` - bundle multiple actions into an array


### The ```condition``` node

Each ```condition``` node has a ```scope``` property that works just like the ```bind``` property, pointing to a model instance node or property, and a ```test``` node that has compare and a value component.

If ```scope``` is not set, scope is assumed to be the same as ```bind```.


If ```test``` is not set, the rule fires on all changes in the given ```scope```.

Example: convert all input to upper case:

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
          rules: [
            {
              action: {
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

Example (age >= 18):

```js
condition: {
    scope: "#/person/age",
    test: {
        gte: 18
    }
}
```
