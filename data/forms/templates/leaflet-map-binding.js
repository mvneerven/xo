const schema = {
  navigation: "static",
  model: {
    logic: context => {
          const o = context.model.instance;  
          o.map.coords = [o.coords.longitude, o.coords.latitude]
        },
    schemas: {
      coords: "https://xo-js.dev/assets/json-schemas/geo-schema.json"
    },
    instance: {
      coords: {
        longitude: 55.826563104319696,
        latitude: -4.255451581529087
      },
      map: {
        coords: [
          0,
          0
        ]
      }
    }
  },
  mappings: {
    properties: {
      latitude: {
        type: "number"
      },
      longitude: {
        type: "number"
      },
      test: {
        type: "map",
        bind: "#/map/coords"
      }
    }
  },
  pages: [
    
  ]
}