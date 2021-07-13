# Controls: multiinput

The ```multiinput``` control was designed to collect complex/related data.

In the case below, the ```person``` property consists of an email address and a name:

```js
const schema = {
  model: {
    instance: {
      data: {
        person: {
          email: "",
          name: ""
        }
      }
    }
  },
  pages: [
    {
      fields: [
        {
          type: "multiinput",
          name: "person",
          bind: "instance.data.person",
          caption: "Person",
          required: true,
          fields: {
            email: {
              caption: "Email Address",
              name: "email",
              type: "email",
              placeholder: "john@doe.com"
            },
            name: {
              type: "text",
              required: true,
              caption: "Name",
              placeholder: "John Doe"
            }
          }
        }
      ]
    }
  ]
}
```

You can use the ```areas``` and ```columns``` properties to tune the layout:

```js
const schema = {
  model: {
    instance: {
      data: {
        person: {
          email: "",
          name: ""
        }
      }
    }
  },
  pages: [
    {
      fields: [
        {
          type: "multiinput",
          name: "person",
          bind: "instance.data.person",
          caption: "Person",
          columns: "8rem 1fr",
          areas: "email name",
          required: true,
          fields: {
            email: {
              caption: "Email Address",
              name: "email",
              type: "email",
              placeholder: "john@doe.com"
            },
            name: {
              type: "text",
              required: true,
              caption: "Name",
              placeholder: "John Doe"
            }
          }
        }
      ]
    }
  ]
}
```