const Core = xo.core;
const DOM = xo.dom;

const area = document.querySelector("[data-pwa-area='main']");
const panel = document.querySelector("[data-pwa-area='panel']");
const logElm = document.createElement("div");
logElm.classList.add("log");

let sharedData = xo.form.data("my-form", o => sharedData = o);


let btn = document.createElement("button")
btn.innerText = "Click me";
//btn.addEventListener("click", e=>{ sharedData.test = "MarcieMarc"})

btn.addEventListener("click", e => {

    //console.log(xo.form.from(document.querySelector("form")))

    sharedData.data.test = "mama"

    return;

    let id = new xo.identity.msal({
        "mode": "popup",
        "libUrl": "https://alcdn.msauth.net/browser/2.15.0/js/msal-browser.js",
        "msal": {
            "auth": {
                "clientId": "2dcef537-9d58-47ac-b389-6310b8f94216",
                "knownAuthorities": [
                    "https://TwelveBCDevTest.b2clogin.com"
                ],
                "authority": "https://TwelveBCDevTest.b2clogin.com/TwelveBCDevTest.onmicrosoft.com/B2C_1_ASF_Dev3/",
                "redirectUri": "<dynamic>"
            },
            "cache": {
                "cacheLocation": "sessionStorage",
                "storeAuthStateInCookie": false
            },
            "loginRequest": {
                "prompt": "select_account",
                "scopes": [
                    "openid",
                    "offline_access",
                    "https://TwelveBCDevTest.onmicrosoft.com/asfbackend/ASFBackend.ReadWrite"
                ]
            },
            "tokenRequest": {
                "scopes": ["https://TwelveBCDevTest.onmicrosoft.com/asfbackend/ASFBackend.ReadWrite"]
            }
        }
    })
    id.load().then(x => {
        x.clientApp.loginPopup().then(x => {
            console.log(x.account);

            x.getJWT(x.account.username).then(j => {
                debugger;
            });

        });
    })

})


panel.appendChild(btn)

panel.appendChild(logElm)

// xo.form.bind(obj=>{
//     log(obj);
//     if(obj.state === "ready"){
//         sharedData = obj.instances.data
//     }
// }, true);


xo.form.run({
    model: {
        instance: {
            data: {
                selectedNodes: null
            }
        }
    },
    pages: [
        {
            legend: "My Form",
            intro: "Selected: @instance.data.selectedNodes",
            fields: [
                {
                    type: "treeview",
                    name: "treeview",
                    bind: "instance.data.selectedNodes",
                    singleSelect: false,
                    minimum: 2,
                    caption: "Treeview",
                    mappings: {
                        title: "name",
                        tooltip: "description",
                        id: "nr"
                    },
                    items: {
                        nr: 0,
                        name: "Tree Structure",
                        children: [
                            {
                                nr: 1,
                                name: "Child with nesting",
                                children: [
                                    {
                                        nr: 2,
                                        name: "Deep nesting"
                                    }
                                ]
                            },
                            {
                                nr: 3,
                                name: "Second child"
                            },
                            {
                                nr: 4,
                                name: "Third child"
                            }
                        ]
                    }

                }
            ]
        }
    ]
}, {
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