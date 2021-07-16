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

const ent = new xo.form.entity({
    dataSchema: "https://apim-asf-poc.azure-api.net/productmanagementapi/openapi",
    uiSchema: "/data/openapi/products-ui.json"
})

area.appendChild(await ent.list())
