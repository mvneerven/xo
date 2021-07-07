const schema = {
  navigation: "static",
  model: {
    schemas: {
      data: {
        $schema: "http://json-schema.org/draft-04/schema#",
        type: "object",
        properties: {
          id: {
            type: "string",
            title: "Id",
            readOnly: true
          },
          recordVersion: {
            type: "integer"
          },
          name: {
            type: "string",
            title: "Name"
          },
          imageUri: {
            type: "string",
            title: "Product Image"
          },
          description: {
            type: "string",
            title: "Description",
            maxLength: 512
          },
          price: {
            type: "object",
            title: "Price",
            properties: {
              amount: {
                title: "Price",
                type: "number",
                minimum: 0,
                multipleOf: 0.01
              },
              currency: {
                title: "Currency",
                type: "integer"
              }
            },
            required: [
              "amount",
              "currency"
            ]
          },
          vatPercentage: {
            type: "number",
            title: "VAT",
            enum: [
              "0",
              "9",
              "21"
            ]
          },
          isForSale: {
            type: "boolean",
            title: "For sale"
          }
        },
        required: [
          "id",
          "name",
          "price",
          "vatPercentage",
          "imageUri"
        ]
      }
    },
    instance: {
      data: {
        
      }
    }
  },
  mappings: {
    skip: [
      "id",
      "recordVersion"
    ],
    pages: {
      
    },
    properties: {
      name: {
        
      },
      imageUri: {
        type: "url",
        dialog: true
      },
      description: {
        
      },
      price: {
        class: "compact",
        page: "prc",
        fields: {
          amount: {
            type: "number",
            prefix: "€",
            step: 0.01,
            required: true
          }
        },
        columns: "6em 4em",
        areas: "\"amount currency\""
      },
      vatPercentage: {
        
      },
      isForSale: {
        
      }
    }
  },
  pages: [
    
  ]
}