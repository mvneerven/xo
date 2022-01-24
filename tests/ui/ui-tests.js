const uiTests = {
  "General tests": {

    form: {
      pages: [
        {
          fields: [
            {
              type: "text",
              name: "text1",
              value: "hello"
            }
          ]
        },
        {
          fields: [
            {
              type: "dropdown",
              name: "drop1",
              items: [
                {
                  name: "None",
                  value: 0
                },
                "1",
                "2"
              ],
              value: "2"
            }
          ]
        }
      ]
    },
    tests: {
      "Form is has 2 pages": (c, x) => {
        return x.root.children.length === 2;
      },

      "Form is complete": (c, x) => {
        return x.root.rendered;
      },

      "Form is rendered and has correct structure": (c, x) => {
        return x.container.nodeName === "DIV" && x.container.classList.contains("exf-container")
      },

      "TextInput Has Correct Value": (c, x) => {
        return x.container.querySelector("[name='text1']").value === "hello";
      },

      "Select Element correctly rendered": (c, x) => {
        return x.container.querySelector("select").name === "drop1"
      },

      "Select Element Has Correct Value": (c, x) => {
        return x.container.querySelector("[name='drop1']").value === "2";
      },

      "Form posts correct values": (c, x) => {
        let posted = x.getFormValues();
        return posted.text1 === "hello" && posted.drop1 === "2";
      },

    }
  },
  "Basic databinding tests": {
    form: {
      model: {
        instance: {
          state: {
            caption: "The Caption"
          },
          data: {
            txt: "Hello dear",
            tags: ["beer", "pong"],
            vl1: "two"
          }
        }
      },
      pages: [
        {
          fields: [
            { type: "text", name: "text1", bind: "#/data/txt", caption: "#/state/caption" },
            { type: "tags", name: "tags1", value: ["dead", "can", "dance"] },
            { type: "tags", name: "tags2", bind: "#/data/tags" },
            { type: "radiobuttonlist", name: "radio1", bind: "#/data/vl1", items: ["one", "two", "three"] }
          ]
        }
      ]

    },
    tests: {
      "Form Has One Page": (c, x) => {
        return x.schema.pages.length === 1
      },

      "Form Field With Name Test1 Is Found": (c, x) => {
        return x.get("text1") != null
      },

      "Form Field With Name test1 has textbox control": (c, x) => {
        return x.get("text1").htmlElement.type === "text";
      },

      "Form field with name test1 has caption bound to state instance": (c, x) => {
        return x.get("text1").container.querySelector("label").innerHTML === "The Caption"
      },

      "Tags are rendered": (c, x) => {
        return x.get("tags1").value.join(", ") === "dead, can, dance";
      },

      "Tags are bound": (c, x) => {
        return x.get("tags2").value.join(", ") === "beer, pong"
      },

      "Radio renders options": (c, x) => {
        return x.get("radio1").container.querySelectorAll("input[name]").length === 3
      },

      "Form posts correct data": (c, x) => {
        return x.getFormValues().tags2.length === 2;
      }
    }
  },
  "Advanced databinding tests": {
    form: {
      submit: true,
      model: {
        instance: {
          data: {
            name: "Marc",
            selected: "One",
            list: [
              "One",
              "Two"
            ]
          }
        }
      },
      pages: [
        {
          legend: "Welcome to XO",
          intro: "This is a generated web form, for #/data/name",
          fields: [
            {
              name: "text1",
              bind: "#/data/name",
              type: "text",
              caption: "Your name",
              placeholder: "John Doe"
            },
            {
              type: "button",
              name: "btn1",
              caption: "Add list item",
              actions: [

                {
                  do: {
                    set: [
                      "#/data/list",
                      [
                        "One",
                        "Two",
                        "Three"
                      ]
                    ]
                  }
                }
              ]
            },
            {
              name: "rbl1",
              type: "radiobuttonlist",
              bind: "#/data/selected",
              items: "#/data/list",
              caption: "List"
            }
          ]
        }
      ]
    },
    tests: {
      "Radio Renders 2 options From Model": (c, x) => {
        let r = x.get("rbl1");
        return r.htmlElement.querySelectorAll("input[type='radio']").length === 2;
      },
      "Select Radio Option Using Model State": (c, x) => {
        return x.get("rbl1").container.querySelector('[value="One"]').hasAttribute("checked")
      },

      "Radio Renders 3 options From Model after clicking button": async (c, x) => {

        return await c.runAndWaitFor(() => {
          x.dataBinding.set("#/data/list",
          [
            "One",
            "Two",
            "Three"
          ])

        }, resolve => {

          setTimeout(() => {
            let r = x.get("rbl1");
            resolve(r.htmlElement.querySelectorAll("input[type='radio']").length === 3)
          }, 20);

        })
      }
    }
  },
  "Buttons": {
    form: {
      pages: [
        {
          fields: [
            {
              type: "button",
              caption: "CLICK",
              icon: "ti-arrow-right",
              actions: [
                {
                  do: {
                    trigger: ["my-event"]
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    tests: {

      "Button has icon 'ti-arrow-right'": (c, x) => {
        return x.container.querySelector(
          "form .exf-page .exf-btn-cnt button span.ti-arrow-right") != null;
      },

      "Clicking button fires 'my-event' Event on form": async (c, x) => {
        return await c.runAndWaitFor(() => {
          x.container.querySelector("button").click();
        }, resolve => {
          x.addEventListener("my-event", resolve(true));
        })

      }
    }
  }
}

export default uiTests;