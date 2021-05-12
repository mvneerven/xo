

const factory = window.xo.form.factory,
  DOM = window.xo.dom,
  log = (ex) => {
    const elm = DOM.parseHTML(`<div>Error: ${ex.toString()}</div>`);
    document.querySelector("footer").appendChild(elm);
    elm.scrollIntoView();
  };

  const schema = {
    model: {
        schemas: {
            person: "/data/json/schemas/person-schema.json",
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
        logic: context => {
            const model = context.model, person = model.instance.person, b = model.bindings;
            b.genderUnknown = !['male', 'female'].includes(person.gender);
            b.title =
                (b.genderUnknown ? '' : (person.gender === 'male' ? 'Mr ' : 'Mrs '))
                + person.name.first + ' ' + person.name.last;
            b.under18 = model.instance.person.age <= 17;
            b.continue = !b.under18 && model.instance.contract.agree;
            b.info = 'agree to proceed'
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
                    min: 16,
                    max: 110,
                    step: 1,
                    caption: "Your age",
                    bind: "instance.person.age"
                },
                {
                    name: "gender",
                    type: "dropdown",
                    disabled: "@bindings.under18",
                    caption: "Gender",
                    items: [
                        {
                            name: "Please choose",
                            value: "unknown"
                        },
                        {
                            name: "Male",
                            value: "male"
                        },
                        {
                            name: "Female",
                            value: "female"
                        },
                        {
                            name: "Not important",
                            value: "unspecified"
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
                    visible: "@bindings.under18",
                    type: "dialog",
                    title: "Info",
                    body: "You have to be over 18 to continue",
                    bind: "instance.contract.info"
                }
            ]
        },
        {
            legend: "Page 2",
            relevant: "@instance.contract.agree",
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

async function run(context) {
  const x = context.createForm();
  listen(x);
  //await x.load("/data/forms/form.js");
  await x.load(schema)
  let result = await x.renderForm();
  document.body.querySelector("main").appendChild(result.container);
}

function listen(x) {
  x.on(factory.events.error, (e) => {
    log(e.detail.error);
  });
}

// async function loadSchema(){
//   schema = await fetch("/data/forms/form.js", {
//     headers: {
//       'Content-Type': 'text/plain',
//       'Accept': 'text/plain'
//     }
//   }).then(x=>x.text());
  
// }

factory.build({ 
    defaults: { 
      validation: "inline" 
    } 
  }).then((context) => {
    run(context);
});
