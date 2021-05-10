import { types } from 'node:util';
import Core from '../pwa/Core';
import ExoFormFactory from './ExoFormFactory';

class ExoFormSchema {

    types = {
        unknown: undefined,
        js: "javascript",
        json: "json"
    }

    constructor(options) {
        Core.addEvents(this); // add simple event system
        this._type = this.types.undefined;
        this.options = options || {};
    }

    parse(schemaData) {
        if (typeof (schemaData) !== "object") {
            
            let test = ExoFormFactory.tryScriptLiteral(schemaData);
            if (test) {
                this._type = this.types.js
                schemaData = test;
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

    triggerEvent(eventName, detail, ev) {
        console.debug("Triggering event", eventName, "detail: ", detail)
        if (!ev) {
            ev = new Event(eventName, { bubbles: false, cancelable: true });
        }

        ev.detail = {
            exoForm: this,
            ...(detail || {})
        };

        return this.dispatchEvent(ev);
    }

    get type() {
        return this._type;
    }

    /**
    * Adds an event handler
    * @param {string} eventName - Name of the event to listen to - Use xo.form.factory.events as a reference
    * @param {function} func - function to attach 
    * @return {object} - The ExoForm instance
    */
    on(eventName, func) {
        console.debug("Listening to event", eventName, func);
        this.addEventListener(eventName, func);
        return this;
    }

    get data() {
        return this._schemaData;
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

    get navigation(){
        return this._schemaData.navigation;
    }

    get validation(){
        return this._schemaData.validation;
    }

    get progress(){
        return this._schemaData.progress;
    }

    get rules(){
        return this._schemaData.rules;
    }

    get theme(){
        return this._schemaData.theme;
    }

    guessType() {
        if (typeof (this.model.logic) === "function") {
            return this.types.js
        }
        return this.types.json;
    }

    toJSONString() {
        return JSON.stringify(this._schemaData, (key, value) => {
            if (key.startsWith("_"))
                return undefined;
            return value;
        }, 2);
    }

    toJSString() {
        return "const schema = " + Core.stringifyJs(this._schemaData, null, 2);
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

        let pageIndex = 0;
        let fieldIndex = 0;
        this._schemaData.pages.forEach(p => {
            fieldIndex = 0
            if (matcher(p, {type: "page", pageIndex: pageIndex})) {
                if (Array.isArray(p.fields)) {
                    p.fields.forEach(f => {
                        if (matcher(f, {type: "field", fieldIndex: fieldIndex})) {
                            matches.push(f)
                        }
                        fieldIndex++;
                    });
                }
            }
        });
        return matches;
    }

    get fieldCount() {
        return this._totalFieldCount;
    }
}

export default ExoFormSchema;