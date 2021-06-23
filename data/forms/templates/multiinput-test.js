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
                    columns: "4rem 8rem 8rem 1fr",
                    areas: "'prefix firstName infix lastName'",
                    fields: {
                        prefix: {
                            type: "text",
                            caption: "Aanhef",
                            lookup: [
                                "Dhr.", "Mevr.", "Mej."
                            ]
                        },
                        firstName: {
                            type: "text",
                            caption: "Voornaam"
                        },
                        infix: {
                            type: "text",
                            caption: "Tussenvoegsel"
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