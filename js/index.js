const Core = xo.core;
const DOM = xo.dom;

class Route extends xo.route {
    async render() {
        const schema = {
            type: "multiinput",
            name: "search-assets",
            fields: {
                email: {
                    type: "email"
                },
                search: {
                    type: "search",
                    caption: "Search",
                    value: "Wahja",
                    lookup: {
                        type: "promise",
                        items: async search => {
                            search = search || ""

                            return ["Wahja", "Test", "Pils", "Cool"].filter(i => {
                                return search === "" || i.toLowerCase().indexOf(search.toLowerCase()) > -1
                            })
                        }
                    }
                },
                image: {
                    type: "image",
                    caption: "Asset Image",
                    value: "https://stasfassetsdev.z6.web.core.windows.net/fb70c487-edfe-4cd4-bd7e-cded4f309b4f/images/products/brugse-zot-blond-33cl.jpg",
                    style: "max-height: 100px; display: block"
                },
                jump: {
                    type: "button",
                    caption: "→",
                    click: e => {
                        debugger
                        e.preventDefault();
                        e.stopPropagation();
                        e.cancelBubble = true;
                        pwa.route = "/assets"
                    }
                }
            },
            areas: `"email search image jump"`,
            columns: "10em 10em 1fr 30px"
        }

        let form = await xo.form.run(schema, {
            on: {
                post: e => {
                    alert(JSON.stringify(e.detail.postData, null, 2))
                },
                dataModelChange: e => {
                    console.log("datamodel change", JSON.stringify(e.detail.model, null, 2))
                },
                schemaLoaded: e => {
                    let schema = e.detail.host.schema;

                    schema.pages[0].fields = schema.pages[0].fields.map(f => {
                        switch (f.name) {
                            case "id":
                            case "recordVersion":
                                f.type = "hidden";
                                break;
                            case "price":
                                f.fields = {
                                    amount: {
                                        type: "number",
                                        prefix: "€"
                                    }
                                }
                                f.columns = "6em 4em";
                                f.areas = `"amount currency"`;
                                break

                            case "vatPercentage":
                                f.type = "dropdown";
                                f.items = [{ name: "None", value: 0 }, 9, 21]
                                break

                            case "imageUri":
                                f.type = "image";
                                break
                            case "tags":
                                f.type = "tags";
                                break
                        }

                        return f;
                    })
                },
                created: e => {
                    alert(e.detail.host)
                },
                error: e => {
                    let ex = e.detail.error;
                    const elm = DOM.parseHTML(`<div>Error: ${ex.toString()}</div>`);
                    document.querySelector("footer").appendChild(elm);
                    elm.scrollIntoView();
                },
                dom: {
                    click: e => {
                        debugger;
                    }
                }

            }
        });

        this.app.UI.areas.main.add(form)

    }
}

class PWA extends xo.pwa {

}

new PWA({
    routes: {
        "/": Route
    }
})
