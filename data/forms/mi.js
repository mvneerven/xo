const schema = {
  model: {
    instance: {
      image: {
        name: "test.jpg",
        ratio: "1:1"
      }
    },
    logic: (context) => { },
  },
  pages: [
    {
      legend: "Image Details",
      intro: "My form description",
      fields: [
        {
          type: "multiinput",
          bind: "instance.image",
          name: "multiinput1",
          caption: "Multiinput",

          columns: "13em 1fr",
          areas: "'name ratio'",
          fields: {
            name: {
              type: "text",
              caption: "File Name"
            },
            ratio: {
              type: "radiobuttonlist",
              caption: "Radiobuttonlist",
              view: "",
              items: ["1:1", "16:9"],
              required: true,
            },
          },
        },
      ],
    },
  ],
};
