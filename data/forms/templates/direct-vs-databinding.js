const schema = {
    model: {
      instance: {
        data: {
          tags: ["Good", "Bad","Ugly" ]
        }
      }
    },
    pages: [
      {
        legend: "My Form!",
        intro: "My form description",
        fields: [
          {
            name: "testField",
            caption: "Test Field",
            type: "tags",
            bind: "instance.data.tags"
          },
          {
            type: "tags",
            name: "tags1",
            caption: "Tags",
            value: [ "Borrowed", "Blue", "Old", "New" ]
          }
        ]
      }
    ]
  }