export default ExoFormSchema;
declare class ExoFormSchema {
    constructor(options: any);
    types: {
        unknown: any;
        js: string;
        json: string;
    };
    _type: any;
    options: any;
    parse(schemaData: any): void;
    _schemaData: any;
    _totalFieldCount: number;
    triggerEvent(eventName: any, detail: any, ev: any): any;
    get type(): any;
    /**
    * Adds an event handler
    * @param {string} eventName - Name of the event to listen to - Use xo.form.factory.events as a reference
    * @param {function} func - function to attach
    * @return {object} - The ExoForm instance
    */
    on(eventName: string, func: Function): object;
    get data(): any;
    get navigation(): any;
    get validation(): any;
    get progress(): any;
    get rules(): any;
    get theme(): any;
    guessType(): string;
    toString(mode: any): any;
    toJSONString(): string;
    logicToJson(data: any): void;
    logicToJs(data: any): void;
    getFunctionBodyLines(f: any): any;
    toJSString(): string;
    get form(): any;
    get pages(): any;
    get model(): any;
    /**
     * query all fields using matcher and return matches
     * @param {function} matcher - function to use to filter
     * @param {object} options - query options. e.g. {inScope: true} for querying only fields that are currenttly in scope.
     * @return {array} - All matched fields in the current ExoForm schema
     */
    query(matcher: Function, options: object): any[];
    get fieldCount(): number;
}
