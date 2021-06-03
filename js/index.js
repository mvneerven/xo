const Core = xo.core;
const DOM = xo.dom;

class Route extends xo.route {

    title = "Home";

    async render() {

        let form = await xo.form.run("/data/forms/products1.js", {
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
class TestRoute extends xo.route {

    title = "Test";

    async render() {
        this.app.UI.areas.main.add("Hello!")
    }
}

class PWA extends xo.pwa {
    routerReady() {
        this.router.generateMenu(this.UI.areas.menu);
    }
}

new PWA({
    routes: {
        "/": Route,
        "/test": TestRoute
    }
})
