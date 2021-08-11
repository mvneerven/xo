const schema = {
    model: {
      instance: {
        person: {
          name: {
            prefix: "",
            firstName: "",
            infix: "",
            lastName: ""
          }
        }
      },
      bindings: {
        
      }
    },
    pages: [
      {
        legend: "My Form",
        intro: "My form description",
        fields: [
          {
            type: "multiinput",
            name: "name",
            bind: "instance.person.name",
            caption: "Uw naam",
            required: true,
            columns: "4rem 6rem 3rem 1fr",
            areas: "'prefix firstName infix lastName'",
            fields: {
              prefix: {
                type: "text",
                caption: "Aanhef",
                autocomplete: {
                    items: [
                  "Dhr.",
                  "Mevr.",
                  "Mej."
                ]
                        
                }
              },
              firstName: {
                type: "text",
                caption: "Voornaam"
              },
              infix: {
                type: "text",
                caption: "Tussenvoegsel",
                tooltip: "Tussenvoegsel"
              },
              lastName: {
                type: "text",
                required: true,
                caption: "Achternaam"
              }
            }
          }
        ]
      }
    ]
  }