const schema = {
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
  ],
  controls: [
    {
      name: "first",
      type: "button",
      caption: "Restart",
      action: "reset",
      class: "form-first exf-btn"
    },
    {
      name: "prev",
      type: "button",
      caption: "◁ Back",
      class: "form-prev exf-btn"
    },
    {
      name: "next",
      type: "button",
      caption: "Next ▷",
      class: "form-next exf-btn"
    },
    {
      name: "send",
      type: "button",
      caption: "Submit",
      class: "form-post exf-btn"
    }
  ]
}