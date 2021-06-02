const schema = {
    pages: [
        {
            fields: [
                // {
                //     name: "files",                    
                //     type: "filedrop"
                // },

                {
                    name: "list",
                    type: "listview",
                    view: "grid",
                    items: "/data/products.json"
                    
                }
            ]
        }
    ]
}