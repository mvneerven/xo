const schema = {
    model: {
        schemas: {
            person: "/data/json/schemas/person-schema.json"
        },
        instance: {
            person: {
                name: {
                    first: "John",
                    last: "Doe"
                },
                age: 57,
                gender: "male"
            },
            contract: {
                agree: false
            }
        },
        logic: (model, exo) => {
            const person = model.instance.person,
                b = model.bindings;

            b.genderUnknown = !['male', 'female'].includes(person.gender);
            b.title =
                (b.genderUnknown ? '' : (person.gender === 'male' ? 'Mr ' : 'Mrs '))
                + person.name.first + ' ' + person.name.last;
            b.under18 = model.instance.person.age <= 17;
            b.continue = !b.under18 && model.instance.contract.agree;

            b.info = 'agree to proceed'
            //if (b.continue) { exo.addins.navigation.next() } 

        }
    },
    pages: [
        {
            legend: "Page 1",
            intro: "My form description",
            fields: [
                {
                    name: "name",
                    type: "name",
                    caption: "Your name",
                    bind: "instance.person.name",
                    value: {
                        first: "John",
                        last: "Doe"
                    },
                    id: "exfb649e49ebfe8"
                }, {
                    name: "age",
                    type: "number",
                    min: 16,
                    max: 110,
                    step: 1,
                    caption: "Your age",
                    bind: "instance.person.age",
                    value: 57,
                    id: "exfe34783d109c5"
                }, {
                    name: "gender",
                    type: "dropdown",
                    disabled: "@bindings.under18",
                    caption: "Gender",
                    items: [
                        {
                            name: "Please choose",
                            value: "unknown"
                        }, {
                            name: "Male",
                            value: "male"
                        }, {
                            name: "Female",
                            value: "female"
                        }, {
                            name: "Not important",
                            value: "unspecified"
                        }
                    ],
                    bind: "instance.person.gender",
                    value: "male",
                    id: "exfc0f0ccb801dd"
                }, {
                    name: "agree",
                    type: "checkbox",
                    caption: "",
                    tooltip: "Check to continue",
                    bind: "instance.contract.agree",
                    value: "",
                    id: "exf19e3c3800fc5",
                    items: [
                        {
                            name: "I have read the <a href='/terms'>terms & conditions</a> and agree to proceed",
                            value: true,
                            checked: "",
                            tooltip: "Check to continue"
                        }
                    ]
                }, {
                    name: "info",
                    visible: "@bindings.under18",
                    type: "dialog",
                    title: "Info",
                    body: "You have to be over 18 to continue",
                    bind: "instance.contract.info",
                    value: "",
                    id: "exf2b63e73ad6da"
                }
            ],
            index: 1,
            isPage: true,
            type: "fieldset",
            class: "exf-cnt exf-page",
            id: "exf3ad596a251b6"
        }, {
            legend: "Page 2",
            relevant: "@instance.contract.agree",
            fields: [
                {
                    name: "why",
                    type: "multiline",
                    caption: "@bindings.title, let us know what you think...",
                    id: "exf81d4e1e2c58a"
                }, {
                    type: "checkboxlist",
                    name: "checkboxlist",
                    caption: "Checkboxlist",
                    items: [
                        "First", "Second"
                    ],
                    id: "exf003bdd26c88c"
                }
            ],
            index: 2,
            isPage: true,
            type: "fieldset",
            class: "exf-cnt exf-page",
            id: "exfeed3d25217a4"
        }
    ],
    form: {

    }
}

export default schema;