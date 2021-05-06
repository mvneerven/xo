const schema = {
    model: {
        instance: {
            person: {
                name: {
                    first: "John",
                    last: "Doe"
                },
                age: 57,
                gender: "m"
            },
            contract: {
                agree: false
            }
        },
        logic: model => {
            const exo = model.exo,
                person = model.instance.person,
                b = model.bindings;

            b.genderUnknown = !['m', 'f'].includes(person.gender);
            b.title =
                (b.genderUnknown ? '' : (person.gender === 'm' ? 'Mr ' : 'Mrs '))
                + person.name.first + ' ' + person.name.last;
            b.over18 = model.instance.person.age >= 18;
            b.continue = b.over18 && model.instance.contract.agree;
            b.info = 'agree to proceed'
            if (b.continue) { exo.nextPage() } else { if (!b.over18) b.info = 'You have to be 18' }

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
                    bind: "instance.person.name"
                },
                {
                    name: "age",
                    type: "number",
                    caption: "Your age",
                    bind: "instance.person.age"
                },
                {
                    name: "gender",
                    type: "dropdown",
                    caption: "Gender",
                    items: [
                        {
                            name: "Please choose",
                            value: ""
                        },
                        {
                            name: "Male",
                            value: "m"
                        },
                        {
                            name: "Female",
                            value: "f"
                        },
                        {
                            name: "Not important",
                            value: "u"
                        }
                    ],
                    bind: "instance.person.gender"
                },
                {
                    name: "agree",
                    type: "checkbox",
                    caption: "I have read the <a href='/terms'>terms & conditions</a> and agree to proceed",
                    tooltip: "Check to continue",
                    bind: "instance.contract.agree"
                },
                {
                    name: "info",
                    type: "info",
                    title: "Info",
                    body: "You have to be over 18 and agree",
                    bind: "instance.contract.info"
                }
            ]
        },
        {
            legend: "Page 2",
            relevant: "@bindings.continue",
            fields: [
                {
                    name: "why",
                    type: "multiline",
                    caption: "@bindings.title, let us know what you think..."
                },
                {
                    type: "checkboxlist",
                    name: "checkboxlist",
                    caption: "Checkboxlist",
                    items: [
                        "First",
                        "Second"
                    ]
                }
            ]
        }
    ]
}
