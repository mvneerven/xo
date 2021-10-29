const schema = {
    model: {
      instance: {
        control: {
          button: ""
        }
      }
    },
    pages: [
      {
        fields: [
          {
            type: "button",
            name: "show",
            caption: "Show dialog! #/control/button",
            actions: [
              {
                do: {
                  dialog: [
                    "dlg1"
                  ]
                }
              },
              {
                if: {
                  property: "#/control/button",
                  is: "confirm"
                },
                do: {
                  alert: [
                    "Pressed confirm!"
                  ]
                }
              }
            ]
          },
          {
            name: "dlg1",
            body: "Test dialog!",
            mode: "side",
            bind: "#/control/button",
            caption: "Test Field",
            type: "dialog"
          }
        ]
      }
    ]
  }