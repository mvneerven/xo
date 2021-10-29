import Core from '../../pwa/Core';
import OpenApiEndPoint from './OpenApiEndPoint';

class OpenApi {
    constructor(data, options) {
        this._raw = data;
        this.events = new Core.Events(this);
        this.options = {
            baseUrl: "https://apim-asf-poc.azure-api.net",
            ...options || {}
        }
    }

    async read() {
        const me = this;
        this._data = Core.isUrl(this._raw) ? await fetch(this._raw).then(x => x.json()) : this._raw
        this._schemas = this._getSchemas();
        this.jsonSchemaId = this.options.schemaId || this.schemas[0].id;
        this.jsonSchema = this.schemas[0].schema;
        let ar = this._determineEndpoints();
        this._api = {};
        for (var name in ar) {
            let endPoint = ar[name];
            this._api[name] = async options => {
                let url = new URL(endPoint.path, this.options.baseUrl);
                const x = await fetch(url, options);
                return await x.json();
            }
        }

        console.debug("OpenApi: Generated API:", this.api)

    }

    get schemas() {
        return this._schemas;
    }

    get api() {
        return this._api;
    }

    _getSchemas() {
        let ar = [];        
        if (this._data.components && this._data.components.schemas) {
            for (var s in this._data.components.schemas) {
                ar.push({
                    id: s,
                    schema: this._data.components.schemas[s]
                })
            }
        }
        if(ar.length === 0)
            throw TypeError("OpenApi schema contains no DTOs")
        return ar;
    }

    _determineEndpoints() {
        const ar = {}
        for (var name in this._data.paths) {
            let ep = this._data.paths[name];
            for (var methodName in ep) {
                let method = ep[methodName];
                if (method.responses && method.responses["200"]) {
                    let r200 = method.responses["200"];
                    let c = r200.content;
                    if (c) {
                        let cjs = c["application/json"];
                        if (cjs?.schema) {
                            // get list of items
                            if (cjs.schema.type === "array" && cjs.schema.items.$ref === "#/components/schemas/" + this.jsonSchemaId) {
                                ar[methodName] = new OpenApiEndPoint(methodName, this._data.info.title.toLowerCase() + name, {
                                    meta: method
                                })
                            }
                            else if (cjs.schema.$ref === "#/components/schemas/" + this.jsonSchemaId) {
                                ar[methodName] = new OpenApiEndPoint(methodName, this._data.info.title.toLowerCase() + name, {
                                    meta: method
                                })
                            }
                        }
                    }
                }
            }
        }
        console.debug("OpenApi: EndPoints", ar);
        return ar;
    }
}

export default OpenApi;