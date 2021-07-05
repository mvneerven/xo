import Core from '../../pwa/Core';
import ExoFormFactory from './ExoFormFactory';
import JSONSchema from './JSONSchema';

/**
 * Hosts the ExoForm json/js form schema and manages its state
 */
class ExoFormSchema {

    types = {
        unknown: undefined,
        js: "javascript",
        json: "json"
    }

    constructor(options) {
        this._type = this.types.undefined;
        this.options = options || {};
        this._jsonSchemas = {};
    }


    parse(schemaData) {
        if (typeof (schemaData) !== "object") {

            let test = ExoFormFactory.tryScriptLiteral(schemaData);
            if (test && test.type === "javascript") {
                this._type = this.types.js;
                if (test.executed)
                    schemaData = test.schema;
                else {
                    throw TypeError("ExoFormSchema: Error in JavaScript Schema: " + test.error);
                }
            }
            else {
                try {
                    schemaData = JSON.parse(schemaData);
                    this._type = this.types.json;
                }
                catch (ex) {
                    throw TypeError("ExoFormSchema: could not convert string to ExoForm schema: " + ex.toString())
                }
            }
        }

        this._schemaData = {
            ...this.options.defaults || {},
            ...schemaData
        };

        this._schemaData.form = this._schemaData.form || {};

        this._schemaData.pages = this._schemaData.pages || [];

        this.refreshStats();

    }

    createDefaultUiIfNeeded() {

        let defaultModelInstance = this.getFirstInstanceName();
        if (!defaultModelInstance) {
            defaultModelInstance = "data";
            this._schemaData.model = this._schemaData.model || { instance: {} };
            this.model.instance[defaultModelInstance] = {};
        }

        if (this.pages.length === 0) {
            let jsc = this.jsonSchemas[defaultModelInstance];
            if(!jsc)
                return;

            let schemaProps = jsc.schema.properties;


            let mapped = this.tryMappings(defaultModelInstance);

            if (this.pages.length === 0)
                this.pages.push({ fields: [] });


            for (var name in schemaProps) {
                if (!mapped.includes(name)) {
                    this.pages[0].fields.push({
                        name: name,
                        bind: `instance.${defaultModelInstance}.${name}`
                    })
                }
            }
        }
    }

    // if mappings object exists in schema, it is used to bind UI state 
    // where json-schema is leading for model and property types. 
    tryMappings(defaultModelInstance) {
        let mapped = [];

        const DEFAULT_PAGE_ID = "_defaultPage";

        if (typeof (this.mappings) === "object") {

            // skip is an Array with fields that need to be excluded from the UI
            if (Array.isArray(this.mappings.skip)) {
                console.debug("mappings.skip found: exclude from UI:", this.mappings.skip)
                mapped = mapped.concat(this.mappings.skip)
            }

            this.mappings.pages = this.mappings.pages || {}

            if (typeof (this.mappings.properties) === "object") {
                console.debug("mappings.properties found")
                for (var name in this.mappings.properties) {
                    let prop = this.mappings.properties[name];
                    if (!prop.page) {
                        prop.page = DEFAULT_PAGE_ID;
                    }

                    this.mappings.pages[prop.page] = this.mappings.pages[prop.page] || {};
                    this.mappings.pages[prop.page].fields = this.mappings.pages[prop.page].fields || [];

                    console.debug("mappings.properties found for", name)
                    this.mappings.pages[prop.page].fields.push({
                        name: name,
                        bind: `instance.${defaultModelInstance}.${name}`,
                        ...prop
                    })
                    mapped.push(name);
                }
            }

            let unplacedFields = [];
            if (typeof (this.mappings.pages) === "object") {
                for (var name in this.mappings.pages) {
                    let page = this.mappings.pages[name];

                    page.fields = page.fields || [];

                    if (name === DEFAULT_PAGE_ID) {
                        unplacedFields = page.fields;
                    }
                    else {
                        this.pages.push(page);
                    }
                }
            }

            if (unplacedFields.length) {
                if (this.pages.length) {
                    this.pages[0].fields = this.pages[0].fields.concat(unplacedFields);
                }
                else {
                    this.pages.push({ fields: unplacedFields });
                }
            }
        }
        return mapped;
    }

    getFirstInstanceName() {
        if (this.model && this.model.instance) {
            let names = Object.getOwnPropertyNames(this.model.instance);
            return names[0];
        }
    }

    refreshStats() {
        this._totalFieldCount = this.query().length;
    }

    addJSONSchema(instanceName, schema) {
        this._jsonSchemas[instanceName] = new JSONSchema(instanceName, schema);
    }

    get form() {
        return this._schemaData.form;
    }

    get pages() {
        return this._schemaData.pages;
    }

    get model() {
        return this._schemaData.model;
    }

    get jsonSchemas() {
        return this._jsonSchemas
    }

    get type() {
        return this._type;
    }

    get data() {
        return this._schemaData;
    }

    get navigation() {
        return this._schemaData.navigation;
    }

    get validation() {
        return this._schemaData.validation;
    }

    get progress() {
        return this._schemaData.progress;
    }

    get rules() {
        return this._schemaData.rules;
    }

    get id() {
        return this._schemaData.id;
    }

    get theme() {
        return this._schemaData.theme;
    }

    /**
     * Controls section for form navigation 
     */
    get controls() {
        return this._schemaData.controls;
    }

    /**
     * UI mappings - used when JSON Schema is used and only UI mapping is needed
     */
    get mappings() {
        return this._schemaData.mappings;
    }

    guessType() {
        if (this.model && typeof (this.model.logic) === "function") {
            return this.types.js
        }
        return this.types.json;
    }

    applyJsonSchemas() {
        this.query().forEach(f => {
            this.applyJsonSchema(f)
        });

    }

    applyJsonSchema(field) {

        if (field.bind) {
            let instanceName = field.bind.split('.')[1];
            if (this.jsonSchemas[instanceName]) {
                this.jsonSchemas[instanceName].apply(field);
            }
        }
    }

    static getPathFromBind(bind) {
        let parts = bind.split('.');
        parts.shift();
        parts.shift();
        return parts.join();
    }

    toString(mode) {

        if (typeof (mode) === "undefined")
            mode = this.type || this.guessType();

        switch (mode) {
            case "js":
            case "javascript":
                return this.toJSString();
            case "json":
                return this.toJSONString();
        }

        return super.toString();
    }

    toJSONString() {

        let data = {
            ...this._schemaData
        }

        this.removeEmptyObject(data, 'form')

        this.logicToJson(data)

        let result = JSON.stringify(data, (key, value) => {
            if (key.startsWith("_"))
                return undefined;
            return value;
        }, 2);

        return result;
    }

    logicToJson(data) {
        let logic;
        if (data.model && typeof (data.model.logic) === "function") {
            logic = data.model.logic;

            data.model.logic = {
                type: "JavaScript",
                lines: this.getFunctionBodyLines(logic)
            };
        }

    }

    logicToJs(data) {
        if (data.model && typeof (data.model.logic) === "object" && data.model.logic.type === "JavaScript" && Array.isArray(data.model.logic.lines)) {
            let body = data.model.logic.lines.map(l => {
                return '\t\t' + l.trim();
            }).join('\n');

            data.model.logic = new Function("context", body);
        }

    }

    getFunctionBodyLines(f) {
        let body = f.toString();
        let p = body.indexOf("{");
        if (p !== -1) {
            body = body.substring(p + 1);
            let parts = body.split('}');
            parts.length--;
            body = parts.join('}');
            let lines = body.split('\n');
            lines = lines.map(l => {
                return l.trim();
            }).filter(l => {
                return l.length > 0;
            });
            return lines;
        }
        return null;
    }

    toJSString() {

        let data = {
            ...this._schemaData
        }

        this.removeEmptyObject(data, 'form')

        this.logicToJs(data)

        let str = Core.stringifyJs(data, null, 2);

        str = str.replace("function anonymous(context\n) {", "context => {");

        return "const schema = " + str;
    }

    removeEmptyObject(obj, name){
        if (obj[name]) {
            if (Object.getOwnPropertyNames(obj[name]).length === 0) {
                delete obj[name]
            }
        }
    }

    /**
     * query all fields using matcher and return matches
     * @param {function} matcher - function to use to filter
     * @param {object} options - query options. e.g. {inScope: true} for querying only fields that are currenttly in scope.
     * @return {array} - All matched fields in the current ExoForm schema
     */
    query(matcher, options) {
        if (matcher === undefined) matcher = () => { return true };
        options = options || {};
        let matches = [];

        if (!this._schemaData || !this._schemaData.pages || !Array.isArray(this._schemaData.pages))
            return matches;

        let pageIndex = 1;
        let fieldIndex = 0;
        this._schemaData.pages.forEach(p => {
            fieldIndex = 0

            let skip = false
            if (options.page && p.index !== options.page) {
                skip = true;
            }

            if (!skip) {
                if (matcher(p, { type: "page", pageIndex: pageIndex })) {
                    if (Array.isArray(p.fields)) {
                        p.fields.forEach(f => {
                            f._page = {
                                index: pageIndex
                            }
                            if (matcher(f, { type: "field", fieldIndex: fieldIndex })) {
                                matches.push(f)
                            }
                            fieldIndex++;
                        });
                    }
                }
            }
            pageIndex++;
        });

        // match controls as well
        if (options.includeControls && Array.isArray(this._schemaData.controls)) {
            this._schemaData.controls.forEach(c => {
                if (matcher(c, { type: "control" })) {
                    matches.push(f)
                };
            });
        }

        return matches;
    }

    get fieldCount() {
        return this._totalFieldCount;

    }
}

export default ExoFormSchema;