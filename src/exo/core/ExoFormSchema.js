import Core from '../../pwa/Core';
import ExoFormFactory from './ExoFormFactory';

class ExoFormSchema {

    types = {
        unknown: undefined,
        js: "javascript",
        json: "json"
    }

    constructor(options) {
        this.events = new Core.Events(this)
        this._type = this.types.undefined;
        this.options = options || {};
    }

    parse(schemaData) {
        if (typeof (schemaData) !== "object") {

            let test = ExoFormFactory.tryScriptLiteral(schemaData);
            if (test && test.type === "javascript") {
                this._type = this.types.js;
                if (test.executed)
                    schemaData = test.schema;
                else {
                    throw "ExoFormSchema: Error in JavaScript Schema: " + test.error;
                }
            }
            else {
                try {
                    schemaData = JSON.parse(schemaData);
                    this._type = this.types.json;
                }
                catch (ex) {
                    throw "ExoFormSchema: could not convert string to ExoForm schema: " + ex.toString()
                }
            }
        }

        if (!schemaData || !schemaData.pages || !Array.isArray(schemaData.pages))
            throw "ExoFormSchema: invalid ExoForm schema";

        this._schemaData = {
            ...this.options.defaults || {},
            ...schemaData
        };

        this._schemaData.form = this._schemaData.form || {};

        this._schemaData.pages = this._schemaData.pages || [];

        this._totalFieldCount = this.query().length;
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

    get theme() {
        return this._schemaData.theme;
    }

    get controls() {
        return this._schemaData.controls;
    }

    guessType() {
        if (this.model && typeof (this.model.logic) === "function") {
            return this.types.js
        }
        return this.types.json;
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

        this.logicToJs(data)

        let str = Core.stringifyJs(data, null, 2);

        str = str.replace("function anonymous(context\n) {", "context => {");

        return "const schema = " + str;
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
            if (options.page && p.index !== options.page){
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