const schema = {
    model: {
        schemas: {
            data: "/data/schemas/assets-schema.json"
        },
        instance: {

            data: {
                id: "ea56912e-0f14-489e-af5f-3e4b7d0a966f",
                name: "Sunset.jpg",
                type: "image/jpeg",
                alt: "Sunset in the mist",
                size: 3874085,
                imageUri: "https://source.unsplash.com/random/600x400",
                tags: ["sunset", "hills", "misty", "clouds"]
            }
        },
        logic: context => {
            let m = context.model;
            m.bindings.edit = !m.instance.data.id 
        }
    },
    
    controls: [
        {
            name: "save",
            type: "button",
            caption: "Save"
        },
        {
            name: "cancel",
            type: "button",
            caption: "Cancel"
        },
    ]
}