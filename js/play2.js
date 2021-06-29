const Core = xo.core;
const DOM = xo.dom;

const area = document.querySelector("[data-pwa-area='main']");
const panel = document.querySelector("[data-pwa-area='panel']");
const logElm = document.createElement("div");
logElm.classList.add("log");

let sharedData = null;

let btn = document.createElement("button")
btn.innerText = "Click me";
btn.addEventListener("click", e=>{ sharedData.test = "MarcieMarc"})

panel.appendChild(btn)

panel.appendChild(logElm)

xo.form.bind(obj=>{
    log(obj);
    if(obj.state === "ready"){
        sharedData = obj.instances.data
    }
}, true);

xo.form.run({
    model: {
        instance: {
            data: {
                test: "Test"
            }
        }
    },
    pages: [
        {
            legend: "My Form",
            intro: "My form description",
            fields: [
                {
                    name: "testField",
                    caption: "Test Field",
                    type: "text",
                    bind: "instance.data.test"
                }, {
                    type: "button",
                    name: "treeview1",
                    caption: "Btn",
                    dropdown: [
                        {
                            name: "Test",
                            click: e => {
                                alert(9)
                            }
                        }
                    ]
                }, {
                    type: "treeview",
                    name: "treeview",
                    caption: "Treeview",
                    columns: {
                        name: "Name"
                    },
                    items: [
                        {
                            name: "Test"
                        }
                    ]
                }, {
                    type: "image",
                    name: "image",
                    caption: "Image",
                    value: "https://source.unsplash.com/random/600x400"
                }
            ]
        }
    ]
}, {
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

// let id = new xo.identity.msal( {

//         "mode": "popup",
//         "msal": {
//             "auth": {
//                 "clientId": "2dcef537-9d58-47ac-b389-6310b8f94216",
//                 "knownAuthorities": [
//                     "https://TwelveBCDevTest.b2clogin.com"
//                 ],
//                 "authority": "https://TwelveBCDevTest.b2clogin.com/TwelveBCDevTest.onmicrosoft.com/B2C_1_ASF_Dev3/",
//                 "redirectUri": "<dynamic>"
//             },
//             "cache": {
//                 "cacheLocation": "sessionStorage",
//                 "storeAuthStateInCookie": false
//             },
//             "loginRequest": {
//                 "scopes": [
//                     "openid",
//                     "offline_access"
//                 ]
//             },
//             "tokenRequest": {
//                 "scopes": []
//             }
//         }

// })
// id.load().then(x=>{
//     x.myMSALObj.loginPopup().then(x=>{
//         debugger;
//     });
// })



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