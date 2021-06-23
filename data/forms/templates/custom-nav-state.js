const schema = {
    model: {
      schemas: {
        person: "/data/schemas/person-schema.json"
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
              const m = context.model, person = m.instance.person,
                  b = m.bindings, a = context.exo.addins;
              b.genderUnknown = !['male', 'female'].includes(person.gender);
              b.title =
                  (b.genderUnknown ? '' : (person.gender === 'male' ? 'Mr ' : 'Mrs '))
                  + person.name.first + ' ' + person.name.last;
              b.under18 = person.age <= 17;
              b.noAgreement = b.under18 || !m.instance.contract.agree;
              b.info = 'agree to proceed';
              b.isFirstPage = a.navigation.currentPage === 1;
  
              a.navigation.preventAutoButtonStates(); // prevent simple wizard state checking
  
              b.nextDisabled = false;
              if(!a.navigation.canMoveNext() || b.noAgreement)
                  b.nextDisabled = true;
              
              b.sendDisabled = !b.isFirstPage && !a.validation.checkValidity();
              
              console.log("navigation - noagreement: " + b.noAgreement + ", next disabled: " + b.nextDisabled);
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
          },{
            name: "price",
            type: "number",
            step: 0.01,
            required: true,
            caption: "Your price",
            prefix: "$",
            bind: "instance.person.price"
          },{
            name: "age",
            type: "number",
            min: 16,
            max: 110,
            required: true,
            step: 1,
            caption: "Your age",
            bind: "instance.person.age"
          },{
            name: "gender",
            type: "dropdown",
            disabled: "@bindings.under18",
            caption: "Gender",
            required: true,
            items: [
              {
                name: "Please choose",
                value: "unknown"
              },{
                name: "Male",
                value: "male"
              },{
                name: "Female",
                value: "female"
              },{
                name: "Not important",
                value: "unspecified"
              }
            ],
            bind: "instance.person.gender"
          },{
            name: "agree",
            type: "checkbox",
            caption: "I have read the <a href='/terms'>terms & conditions</a> and agree to proceed",
            tooltip: "Check to continue",
            bind: "instance.contract.agree"
          },{
            name: "info",
            visible: "@bindings.under18",
            type: "dialog",
            title: "Info",
            body: "You have to be over 18 to continue",
            bind: "instance.contract.info"
          }
        ]
      },{
        legend: "Page 2",
        relevant: "@instance.contract.agree",
        fields: [
          {
            name: "why",
            type: "multiline",
            caption: "@bindings.title, let us know what you think..."
          },{
            type: "checkboxlist",
            name: "checkboxlist",
            caption: "Checkboxlist",
            required: true,
            items: [
              "First","Second"
            ]
          }
        ]
      }
    ],
    controls: [
      {
        name: "reset",
        type: "button",
        caption: "Back to page one",
        class: "form-reset",
        disabled: "@bindings.isFirstPage"
      },{
        name: "prev",
        type: "button",
        caption: "◁ Back",
        class: "form-prev",
        disabled: "@bindings.isFirstPage"
      },{
        name: "next",
        type: "button",
        caption: "Next ▷",
        class: "form-next",
        disabled: "@bindings.noAgreement"
      },{
        name: "send",
        type: "button",
        caption: "Submit",
        class: "form-post",
        disabled: "@bindings.sendDisabled"
      }
    ]
  }