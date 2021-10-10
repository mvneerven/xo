const schema = {
  model: {
    instance: {
      data: {
        
      }
    }
  },
  navigation: "none",
  pages: [
    {
      legend: "",
      intro: "",
      fields: [
        {
          name: "grid",
          type: "listview",
          items: "https://xo-js.dev/assets/data/products-sample.json",
          pageSize: 6,
          checkboxes: true,
          bind: "instance.data.items",
          views: [
            "grid",
            "tiles"
          ],
          mappings: {
            grid: [
              {
                key: "name",
                height: "2rem",
                width: "14rem"
              },
              {
                key: "description",
                autoWidth: true
              },
              {
                key: "imageUri"
              },
              {
                key: "price"
              }
            ],
            tiles: [
              {
                key: "imageUri",
                height: "100px"
              },
              {
                key: "name",
                height: "auto"
              },
              {
                key: "price"
              }
            ]
          },
          contextMenu: {
            direction: "left",
            items: [
              {
                tooltip: "Edit",
                icon: "ti-pencil",
                action: "edit"
              },
              {
                tooltip: "Delete",
                icon: "ti-close",
                action: "delete"
              }
            ]
          },
          properties: [
            {
              key: "id",
              type: "string",
              name: "Id"
            },
            {
              key: "name",
              type: "string",
              name: "Name",
              class: "name"
            },
            {
              key: "imageUri",
              type: "img",
              name: "Product Image",
              class: "small hide-xs"
            },
            {
              key: "description",
              type: "string",
              name: "Description",
              class: "small hide-sm"
            },
            {
              key: "price",
              type: "number",
              name: "Price",
              class: "small hide-xxs"
            }
          ]
        }
      ]
    }
  ]
}