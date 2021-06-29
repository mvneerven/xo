const Core = xo.core;
const DOM = xo.dom;

const area = document.querySelector("[data-pwa-area='main']");

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
            action: e=>{
                debugger
            }
        }
    }
).then(x => {

    area.appendChild(x)

})




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




xo.on("new-form", e => {
    if (e.detail.id === "my-form") {
        e.detail.exoForm.on("schemaLoaded", ev => {
            data = ev.detail.host.dataBinding.model.instance.data
        })
    }
})



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
