# JSON Schema Support

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

... your average XO form UI schema looks a lot simpler:

```js
pages: [
    {
        fields: [
            { bind: "#/data/name" },
            { bind: "#/data/type"}, 
            { bind: "#/data/alt" },
            { bind: "#/data/size"},
            { 
                bind: "#/data/imageUri",
                disabled: true
            }, 
            { 
                bind: "#/data/imageUri",
                caption: " " ,
                type: "image",
                style: "max-width: 400px"
            }, 
            {
                name: "tags",
                bind: "#/data/tags",
                type: "tags"
            }
        ]
    }
]
```

... which will result in this form:

![Portal](https://xo-js.dev/assets/img/schema-form.png "The resulting form")


## The mappings property

With a JSON Schema in the lead, form generation is easier than ever.
The JSON Schema provides a lot of information that helps XO form in binding to a model.
What you need then is an intuitive way of mapping and customizing the UI for each control, given the rich possibilities XO form (and extensions) provide.

With *bindings*, you can reuse the property layout in a JSON Schema to specify any customizations per property:

Example:

```js
const schema = {
  navigation: "static",
  model: {
    schemas: {
        data: "/data/schemas/product-schema.json"
    },
    instance: {
        data: {
            id: "ea56912e-0f14-489e-af5f-3e4b7d0a966f",
            name: "Test Product",
            description: "Product description",
            price: {
                amount: 34.45,
                currency: 978
            },
            isForSale: true,
            vatPercentage: 9,
            imageUri: "https://cdn.domain.com/st6fvmyd/assets/img/testprod1.jpg",
            tags: ["sunset", "hills", "misty", "clouds"]
        }
    }
},

mappings: {
    skip: ["recordVersion"],

    pages: { 
        one: { legend: "Hello" },
        two: { legend: "Bye" }
    },

    properties: {
        id: {
            type: "hidden"
        },
        name: {
            autocomplete: { items: ["Good", "Bad", "Ugly"] }
        },
        imageUri: {
            page: "two",
            type: "image"
        },

        price: {
            class: "compact",
            fields: {
                amount: {
                    type: "number",
                    prefix: "€"
                }
            },
            columns: "6em 4em",
            areas: `"amount currency"`
        },
        tags: {
            type: "tags"
        },
        isForSale: {
            type: "switch"
        }
    }
}
```

## Misc
- xo.form.factory.readJSONSchema() method