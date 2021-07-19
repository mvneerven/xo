const Core = xo.core;
const DOM = xo.dom;

const schema = {
  model: {
    logic: context => {
      if (context.changed.property === "button") {
        // e.changed.newValue
      }
    },
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
          caption: "Show dialog! @instance.control.button",
          action: "dialog:dlg1"
        },
        {
          name: "dlg1",
          body: "Test dialog!",
          caption: "Test Field",
          type: "dialog",
          bind: "instance.control.button"
        }
      ]
    }
  ]
}

let fr = await xo.form.sandbox(schema);
document.body.appendChild(fr)


