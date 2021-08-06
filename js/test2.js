const Core = xo.core;
const DOM = xo.dom;

const model = {
  instance: {
    data: {
      raceCaptions: {
        race: "Wat is het ras?",
        bastard: "Welk ras zit er het meest in?"
      },
      raceCaption: undefined,
      nameVar: "je huisdier",
      pets: [
        {
          id: "dog",
          name: "Hond",
          imageUri: "https://petplan.nl/wp-content/plugins/petplan-aanvraagstraat/public/dist/assets/img/dog/animal-select.png"
        },
        {
          id: "cat",
          name: "Kat",
          imageUri: "https://petplan.nl/wp-content/plugins/petplan-aanvraagstraat/public/dist/assets/img/cat/animal-select.png"
        },
        {
          id: "parrot",
          name: "Pagegaai",
          imageUri: "https://petplan.nl/wp-content/plugins/petplan-aanvraagstraat/public/dist/assets/img/parrot/animal-select.png"
        },
        {
          id: "konijn",
          name: "Konijn",
          imageUri: "https://petplan.nl/wp-content/plugins/petplan-aanvraagstraat/public/dist/assets/img/rabbit/animal-select.png"
        }
      ]
    },
    pet: {
      type: undefined,
      typeName: undefined,
      name: undefined,
      raceType: "race"
    },

  },
  logic: e => {
    
    const i = e.model.instance;
    const pet = i.data.pets.find(f => {
      return f.id === i.pet.type;
    })
    if(e.changed.property === "type"){
      
      i.pet.race = ""
    }
    if (pet) {
      i.pet.typeName = pet.name;
    }
    if (i.pet.raceType) {
      i.data.raceCaption = i.data.raceCaptions[i.pet.raceType];
    }
    i.data.nameVar = i.pet.name || "je huisdier"
  }
}

fetch("/data/pet-race.json").then(x => x.json()).then(x => {
  model.races = x;
  const schema = {
    model: model,
    navigation: "auto",
    pages: [
      {
        legend: "Bereken je premie",
        intro: "Selecteer je huisdier",
        fields: [
          {
            name: "grid",
            bind: "instance.pet.type",
            required: true,
            singleSelect: true,
            type: "listview",
            items: "@instance.data.pets",
            pageSize: 6,
            views: [
              "tiles"
            ],
            mappings: {
              tiles: [
                {
                  key: "imageUri",
                  height: "100px"
                },
                {
                  key: "name",
                  height: "auto"
                },
                {
                  key: "price"
                }
              ]
            },
            properties: [
              {
                key: "id",
                type: "string",
                name: "Id"
              },
              {
                key: "name",
                type: "string",
                name: "Name",
                class: "name"
              },
              {
                key: "imageUri",
                type: "img",
                name: "Product Image"
              },
              {
                key: "description",
                type: "string",
                name: "Description",
                class: "small hide-sm"
              },
              {
                key: "price",
                type: "number",
                name: "Price"
              }
            ]
          }
        ]
      },
      {
        legend: "Over jouw @instance.pet.typeName",
        fields: [
          {
            type: "text",
            name: "name",
            bind: "instance.pet.name",
            required: true,
            caption: "Hoe heet je @instance.pet.typeName?"
          },
          {
            type: "dropdown",
            name: "age",
            bind: "instance.pet.age",
            required: true,
            caption: "Hoe oud is @instance.pet.name?",
            items: [
              {
                name: "Maak een keuze",
                value: -1
              },
              {
                name: "Minder dan 1 jaar",
                value: 0
              },
              {
                name: "1 jaar",
                value: 1
              },
              {
                name: "2 jaar",
                value: 2
              },
              {
                name: "3 jaar",
                value: 3
              },
              {
                name: "4 jaar",
                value: 4
              },
              {
                name: "5 jaar",
                value: 5
              },
              {
                name: "6 jaar",
                value: 6
              },
              {
                name: "7 jaar",
                value: 7
              }
            ]
          },
          {
            type: "radiobuttonlist",
            caption: "Is het een ras of een kruising?",
            name: "raceType",
            bind: "instance.pet.raceType",
            view: "list",
            items: [
              {
                name: "Ras",
                value: "race"
              },
              {
                name: "Kruising",
                value: "bastard"
              }
            ]
          },
          {
            type: "text",
            name: "race",
            caption: "@instance.data.raceCaption",
            bind: "instance.pet.race",
            required: true,
            autocomplete: {
              minlength: 2,
              items: getRaceList,
              max: 10
            }
          },
          {
            type: "text",
            name: "postcode",
            caption: "Wat is je postcode?",
            required: true,
            bind: "instance.pet.postCode",
            maxlength: 6,
            pattern: "^[1-9][0-9]{3} ?(?!sa|sd|ss|SA|SD|SS)[A-Za-z]{2}$"
          }
        ]
      },
      {
        legend: "Sluit polis af",
        intro: "Haha",
        fields: [
          {
            type: "button",
            class: "cta",
            caption: "Bereken je premie"
          }
        ]
      }
    ]
  }

  render(schema)

})


async function render(schema) {
  let fr = await xo.form.run(schema, {
    on: {
      schemaLoaded: e => {
        window.exo = e.detail.host;
      }
    }
  });
  document.querySelector('[data-pwa-area="main"]').appendChild(fr)
}


function getRaceList(options) {
  const inst = exo.dataBinding.model.instance;
  if (!options.search)
    return [];

  let ar = [];
  for (const i of model.races[inst.pet.type]) {
    if (i.name.toLowerCase().indexOf(options.search.toLowerCase()) >= 0) {
      ar.push({
        text: i.name
      })
      if (ar.length === 10) {
        break;
      }
    }
  }

  return ar;
}