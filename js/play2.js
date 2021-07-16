const Core = xo.core;
const DOM = xo.dom;

const area = document.querySelector("[data-pwa-area='main']");
const panel = document.querySelector("[data-pwa-area='panel']");

const schema = {
    theme: "fluent",
    pages: [
        {
            legend: "Page 1",
            fields: [

            ]
        }
    ]
}

const context = await xo.form.factory.build();
Object.keys(context.library).forEach(p => {
    console.log(p);
    let props = context.library[p];
    if (!props.hidden) {
        schema.pages[0].fields.push({
            type: p,
            name: p + "1",
            caption: Core.toWords(p),
            ...props.demo || {}
        })
    }
});

//context.lib
//debugger;


xo.form.run(schema, {
    id: "my-form",
    DOMChange: "change"
}).then(x => { area.appendChild(x) });

function log(obj) {
    let li = document.createElement("div");
    li.title = "Form " + obj.exo.id + " - " + obj.state;
    switch (obj.state) {
        case "ready":
            li.innerText = obj.exo.id + " ready";
            break
        case "change":
            li.innerText = (obj.log || "none");
            break;
    }

    logElm.appendChild(li);
}

if (false) {

    xo.form.run(
        {
            pages: [
                {

                    fields: [{
                        type: "button",
                        icon: "ti-heart",
                        name: "b1",
                        action: "test",
                        click1: e => {
                            debugger;
                        },
                        direction: 'right',
                        dropdown: [
                            {
                                caption: `Select all`,
                                icon: "ti-check-box",
                                tooltip: "Select all",
                                action: "select"

                            },
                            {
                                caption: `Deselect all`,
                                icon: "ti-layout-width-full",
                                tooltip: "Deselect all",
                                action: "deselect"
                            },
                        ]
                    }]
                }
            ]
        }, {
        on: {
            action: e => {
                debugger
            }
        }
    }
    ).then(x => {

        area.appendChild(x)

    })

}


let data = null;




if (false) {
    const ent = new xo.form.entity({
        jsonSchema: "/data/schemas/product-schema.json",

        api: {
            get: query => {
                return fetch("/data/products.json").then(x => x.json())
            }
        }
    })
        .on("edit", async e => {
            e.preventDefault();
            let frm = await e.detail.host.edit(e.detail.item);


            //e.returnValue = false;
        })


    area.appendChild(await ent.list())

}