# XO form Data Binding

## Model Binding

XO form supports multiple model binding, allowing you to bind parts of your form to specified data models.

```json
{
  "model": {
    "instance": {
      "person": {
        "name": "John",
        "email": "john@doe.com"
      }
    }
  },
  "pages": [
    {
      "legend": "My Form",
      "fields": [
        {
          "type": "text",
          "caption": "Name",
          "bind": "#/person/name"
        },
        {
          "type": "email",
          "caption": "Email address",
          "bind": "#/person/email"
        }
      ]
    }
  ]
}
```

### Logic 

You can add a logic property in your forms to allow for dynamic behavior based on changes in the model.

In the example below, an age property is calculated, which controls state 

```js
const schema = {
  submit: false,
  model: {
    logic: context => {
      const inst = context.model.instance;
      if (context.changed?.path === "#/person/birthdate") {
        inst.state.age = xo.core.calcAge(context.changed.newValue);
        inst.state.under18 = inst.state.age < 18;
      }
    },
    instance: {
      state: {
        age: -1,
        under18: true
      },
      person: {
        name: {
          first: "John",
          last: "Doe"
        },
        birthdate: "",
        gender: "unknown"
      },
      contract: {
        agree: false
      }
    }
  },
  pages: [
    {
      legend: "Enter your details",
      fields: [
        {
          name: "name",
          type: "name",
          caption: "Your name",
          bind: "#/person/name"
        },
        {
          name: "gender",
          type: "dropdown",
          caption: "Gender",
          items: [
            {
              name: "Please choose",
              value: "unknown"
            },
            {
              name: "Male",
              value: "male"
            },
            {
              name: "Female",
              value: "female"
            },
            {
              name: "Not important",
              value: "unspecified"
            }
          ],
          bind: "#/person/gender"
        },
        {
          name: "birthdate",
          type: "date",
          min: "1921-01-01",
          max: "2015-01-01",
          step: 1,
          caption: "Your birthdate",
          bind: "#/person/birthdate",
          info: "You have to be over 18 to continue"
        },

        {
          name: "agree",
          disabled: "#/state/under18",
          type: "checkbox",
          caption: "I have read the <a target='_blank' href='/terms'>terms & conditions</a> and agree to proceed",
          tooltip: "Check to continue",
          bind: "#/contract/agree"
        }
      ]
    },
    {
      legend: "Finalize",
      relevant: "#/contract/agree",
      fields: [
        {
          type: "button",
          class: "exf-lg",
          caption: "Submit",
          actions: [
            {
              do: {
                alert: [
                  "Submitted!"
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

> Update: From version 1.5, you can now use ```#/instancename/propertyname``` to refer to state in your model.

## Instances from URLs (> 1.5.4)

You can now point an instance to a URL.

```js
{
  "model": {
    "instance": {
      "people": "https://my.rest.api/people"
    }
  },
  "pages": [
    {
      "legend": "My Form",
      "fields": [
        {
          "type": "listview",
          "caption": "People",
          "items": "#/people/names"
        }
      ]
    }
  ]
}

```


---
See also: [rules engine](./rules.md)
