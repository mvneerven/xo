const Core = xo.core;
const DOM = xo.dom;

document.body.querySelector("main").appendChild(await xo.form.run("/data/forms/products.js", {
    on: {
        post: e => {
            alert(JSON.stringify(e.detail.postData, null, 2))
        },


        schemaLoaded: e => {
            let schema = e.detail.host.schema;

            // schema.pages[0].fields = schema.pages[0].fields.map(f => {
            //     if (f.name === "coordinates") {
            //         f.type = "element";
            //         f.tagName = "iframe";
            //         f.src = "//www.embed-leaflet.com/map?center=47.606011,-122.332147&zoom=8&style=&marker=true&popup=true&title=Marker&enhancedScroll=true"
            //     }

            //     return f;
            // })

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
        }
    }
}));

// let div = await xo.form.run({
//   type: "aceeditor",
//   name: "htmlEditor",
//   caption: "Html"
// });

// document.body.appendChild(div)

// let ctl = await xo.form.run({
//   type: "checkbox",
//   name: "checkbox1",
//   caption: "Auto save"
// })

// document.body.appendChild(ctl)

// const factory = window.xo.form.factory,
//   DOM = window.xo.dom,
//   log = (ex) => {
//     const elm = DOM.parseHTML(`<div>Error: ${ex.toString()}</div>`);
//     document.querySelector("footer").appendChild(elm);
//     elm.scrollIntoView();
//   };


// async function run(context) {
//   const x = context.createForm();
//   listen(x);
//   await x.load("/data/forms/mi.js");
//   let result = await x.renderForm();

//   document.body.querySelector("main").appendChild(result.container);

// }

// function listen(x) {
//   x.on(factory.events.error, e => {
//     log(e.detail.error);
//   }).on(factory.events.post, e => {
//     alert(JSON.stringify(e.detail.postData, null, 2))

//     // this.upload(e.detail.postData.files).then(x => {
//     //   debugger;
//     // })
//   });
// }

// function upload(files) {


//   // https://func-assetrepo-dev.azurewebsites.net/api/func-uploadasset-dev?code=/4fQtcDY04JhBn45RGJaJPbScM2faA/Esxsn6B6yO0JZLbr/Uka6zA==
//   return fetch("https://func-assetrepo-dev.azurewebsites.net/api/func-uploadasset-dev?code=XaFrCC0F2oKxt5yUIheIkSNC6FpifMTNxWNHEHy5WC7fWoK0M1VhYw==&clientId=apim-apim-asf-poc", {
//     method: "POST",
//     body: JSON.stringify({
//       path: "testfolder/images",
//       files: files
//     })
//   }).then(x => {
//     if (x.status === 200) {
//       return x.json()
//     }
//     throw `HTTP Status ${x.status}: ${x.statusText} (type: ${x.type})`;
//   });
// }

// factory.build({
//   defaults: {
//     validation: "inline"
//   }
// }).then((context) => {
//   run(context);
// });
