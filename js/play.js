const Core = xo.core, DOM = xo.dom;

window.stdFetch = window.fetch;
window.fetch = async (url, options) => {
    console.log("FETCH", url.toString());

    options = {
        ...options || {},
    }
    options.headers = options.headers || {};
    options.headers["tenant-id"] = "4d86005d-a499-46b4-80d1-eb571202027b";

    return window.stdFetch(url, options);
}

const area = document.querySelector("[data-pwa-area='main']");

/*
  dataSchema1: "https://apim-asf-poc.azure-api.net/productmanagementapi/openapi",
    uiSchema1: "/data/openapi/products-ui.json"
 */

const ent = new xo.form.entity({
    dataSchema: "/data/openapi/assets-openapi.json",
    uiSchema: null   
    
})

area.appendChild(await ent.list());


// const editor = await ent.createEditor({})
// area.appendChild(await editor.render({
//     on: {
//         interactive: e => {
//             const led = new xo.form.factory.LiveEditor(e.detail.host).on("schema-change", e => {
//                 //console.log(e.detail.schema.toString())
//             })
//         }
//     }
// }))
