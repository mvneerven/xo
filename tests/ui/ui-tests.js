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
            },
            {
              type: "checkbox",
              caption: "aa",
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
      "Form has 2 pages": (c, x) => {
        return x.root.pages.length === 2;
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
  "Disable controls": {
    form: schema = {
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
              name: "email",
              placeholder: "john@doe.com",
              bind: "#/data/email",
              type: "email",
              prefix: {
                icon: "ti-email"
              },
              actions: [
                {
                  "do": {
                    enable: [
                      "#/data/receive"
                    ]
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    tests: {
      "Email control is disabled": (c, x) => {
        return x.get("email").disabled === true;
      },

      "Email control is enabled after clicking checkbox": async (c, x) => {
        const f = b => {
          resolve(b)
        }
        return await c.runAndWaitFor(() => {
          x.container.querySelector("input[type=checkbox]").click();

        }, f => {
          setTimeout(() => {
            f(x.get("email").disabled === false)
          }, 20);
        })


      }
    }
  },
  "Listview tests": {
    form: {
      pages: [
        {
          fields: [
            {
              name: "grid",
              type: "listview",
              items: [
                {
                  id: "8c93b7b0",
                  name: "Nice 1st item",
                },
                {
                  id: "8c93b7b1",
                  name: "Nice 2nd item",
                }
              ],
              pageSize: 16,
              bind: "#/data/selection",
              views: [
                "tiles"
              ],
              mappings: {
                tiles: [
                  {
                    key: "name",
                    height: "auto"
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
                  name: "Name"

                }
              ]
            }
          ]
        }
      ]
    },
    tests: {
      "Listview renders two items having ids '8c93b7b0' and '8c93b7b1'": async (c, x) => {
        return await c.runAndWaitFor(() => {
        }, resolve => {
          setTimeout(() => {
            let ids = [...x.container.querySelectorAll("[data-field-type='listview'] article")].map(i => {
              return i.getAttribute("data-id")
            });
            resolve(ids.join(",") === "8c93b7b0,8c93b7b1");
          }, 20);
        })
      },
      "Listview selection updates model": async (c, x) => {
        return await c.runAndWaitFor(() => {

        }, resolve => {
          setTimeout(() => {
            x.container.querySelector("[data-field-type='listview'] article[data-id='8c93b7b1']").click();

            setTimeout(() => {
              resolve(x.getInstance("data").selection.join() === "8c93b7b1")
            }, 20);

          }, 20);
        })
      }
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
  "Advanced databinding tests - Part I": {
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
  "Advanced databinding tests - Part II": {
    form: {
      rem: "Using logic to autofill bound control",
      submit: true,
      model: {
        logic: context => {
          const i = context.model.instance;
          i.data.text = ((i.data.prefix || "") + " " + (i.data.name || "")).trim()
        },
        instance: {
          data: {
            name: "John Doe",
          }
        }
      },
      pages: [
        {
          legend: "Using logic to autofill bound control",
          fields: [
            {
              type: "group",
              fields: [
                {
                  bind: "#/data/prefix",
                  name: "prf1",
                  caption: "Prefix",
                  autocomplete: {
                    items: ["Mr.", "Mrs.", "Ms", "Dr"]
                  }
                },
                {
                  bind: "#/data/name",
                  caption: "Your name",
                  placeholder: "John Doe"
                },
              ]
            },

            {
              caption: "Addressing you",
              name: "addr1",
              readonly: true,
              bind: "#/data/text",
            }
          ]
        }
      ]
    },
    tests: {
      "Check initial value of bound text control": (c, x) => {
        return x.container.querySelector("[name='addr1']").value === "John Doe"
      },

      "Check modified value of bound text control after changing a value that triggers custom logic": async (c, x) => {
        return await c.runAndWaitFor(() => {
          let prf = x.container.querySelector("[name='prf1']");
          let ctl = xo.control.get(prf);
          prf.value = "Mr.";
          ctl.triggerChange();
        }, resolve => {
          setTimeout(() => {
            resolve(x.container.querySelector("[name='addr1']").value === "Mr. John Doe")
          }, 20);
        })
      }
    }
  },

  "Buttons": {
    form: {
      submit: false,
      model: {
        instance: {
          data: {
            name: "",
            style: "",
            caption: "Text field"
          }
        }
      },
      pages: [
        {
          fields: [
            {
              bind: "#/data/name",
              type: "text",
              caption: "#/data/caption",
              placeholder: "John Doe",
              style: "#/data/style"
            },
            {
              type: "button",
              caption: "Test",
              name: "btn1",
              icon: "ti-arrow-right",
              actions: [
                {
                  "do": {
                    set: [
                      "#/data/caption",
                      "New label text"
                    ]
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

      "Clicking button changes textbox caption to 'New label text'": async (c, x) => {

        return await c.runAndWaitFor(() => {
          x.container.querySelector("button[name='btn1']").click();

        }, resolve => {
          setTimeout(() => {
            resolve(x.container.querySelector("[data-field-type='text'] .exf-ctl label").innerText === "New label text")
          }, 20);
        })

      }
    }
  },
  "Wizards": {
    form: {
      navigation: "wizard",
      validation: "inline",
      pages: [
        {
          legend: "Page 1",
          intro: "This is page 1",
          fields: [
            {
              name: "field1",
              type: "text",
              required: true,
              caption: "A text field"
            },
            {
              name: "field2",
              type: "radiobuttonlist",
              required: true,
              caption: "Radio buttons",
              items: [
                "Option 1",
                "Option 2",
                "Option 3",
                "Option 4"
              ]
            }
          ]
        },
        {
          legend: "Page 2",
          intro: "This is page 2",
          fields: [
            {
              name: "field3",
              required: true,
              type: "multiline",
              autogrow: true,
              caption: "A multiline field"
            }
          ]
        }
      ]
    },
    tests: {
      "Navigation tests": async (c, x) => {
        return await c.runAndWaitFor(() => {
        }, resolve => {
          setTimeout(() => {
            let disabled = x.container.querySelector(
              ".exf-nav-cnt button[name='next']").closest(".exf-disabled") != null;

            resolve(disabled)
          }, 10);
        })
      }
    }
  }
}

export default uiTests;