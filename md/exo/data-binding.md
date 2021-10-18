# XO form Data Binding

## Model Binding

XO form supports multiple model binding, allowing you to bind parts of your form to specified data models.


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

### Logic 

You can add a logic property in your forms to allow for dynamic behavior based on changes in the model.

```js
const schema = {
    model: {
        schemas: {
            person: "/data/schemas/person-schema.json"
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

> Update: From version 1.5, you can now use ```#/instancename/propertyname``` to refer to state in your model.

---
See also: [rules engine](./rules.md)
