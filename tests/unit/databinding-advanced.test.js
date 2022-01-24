const xo = require("../../dist/xo.cjs.js").default;


describe("XO form databinding Tests", () => {
  let context = {};

  beforeAll(() => {
    console.debug = e => { };

    return form({
      submit: true,
      model: {
        instance: {
          data: {
            name: "",
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
              name: "ch1",
              type: "radiobuttonlist",
              bind: "#/data/selected",
              items: "#/data/list",
              caption: "List"
            }
          ]
        }
      ]
    }).then(x => {

      context = x
    }).catch(ex => {

    })
  });


  it("Radio renders options from instance", () => {
    expect(context.exo.get("ch1").container.querySelectorAll("input[name]").length).toBe(2);
  });

  it("Radio selects option using model state", () => {
    expect(context.exo.get("ch1").container.querySelector('[value="One"]').hasAttribute("checked")).toBe(true);
  });

})

function form(schema) {
  return new Promise((resolve, reject) => {
      xo.form.run(schema, {
          on: {
              interactive: e => {
                  let context = {
                      exo: e.detail.host,
                      posted: e.detail.host.getFormValues()
                  }
                  resolve(context);
              }
          }
      })
  });
}