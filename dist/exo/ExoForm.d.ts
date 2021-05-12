export default ExoForm;
/**
 * ExoForm class.
 * Created using ExoFormContext create() method
 *
 * @hideconstructor
 */
declare class ExoForm {
    static meta: {
        properties: {
            all: string[];
            map: {
                class: string;
                readonly: string;
                dirname: string;
                minlength: string;
                maxlength: string;
            };
            reserved: string[];
        };
        templates: {
            empty: string;
            exocontainer: string;
            legend: string;
            pageIntro: string;
            datalist: string;
            datalistItem: string;
            button: string;
        };
    };
    static _staticConstructor: void;
    static setup(): void;
    constructor(context: any, opts: any);
    context: import("./ExoFormFactory").ExoFormContext;
    options: any;
    form: HTMLFormElement;
    container: ChildNode;
    get schema(): import("./ExoFormSchema").default;
    /**
     * load ExoForm schema (string or )
     * @param {any} schema - A JSON ExoForm Schema string or object, or URL to fetch it from.
     * @return {Promise} - A Promise returning the ExoForm Object with the loaded schema
     */
    load(schema: any, options: any): Promise<any>;
    /**
     * load ExoForm schema from object
     * @param {any} schema - A JSON ExoForm Schema object.
     * @return {any} - the loaded schema
     */
    loadSchema(schema: any): any;
    _schema: import("./ExoFormSchema").default;
    _dataBinding: ExoFormDataBinding;
    /**
    * Gets the data binding object
    * @return {object} - The ExoFormDataBinding instance associated with the form.
    */
    get dataBinding(): any;
    bind(instance: any): void;
    _mappedInstance: any;
    _createComponents(): void;
    addins: {};
    triggerEvent(eventName: any, detail: any, ev: any): any;
    /**
     * Render ExoForm schema into a form
     * Returns a Promise
     */
    renderForm(): Promise<any>;
    _finalizeForm(): void;
    _cleanup(): void;
    /**
    * Adds an event handler
    * @param {string} eventName - Name of the event to listen to - Use xo.form.factory.events as a reference
    * @param {function} func - function to attach
    * @return {object} - The ExoForm instance
    */
    on(eventName: string, func: Function): object;
    _renderPages(): Promise<any>;
    _addRendered(f: any, rendered: any, pageFieldsRendered: any, p: any, page: any): any;
    _getFormContainerProps(): any;
    _enrichPageSettings(p: any, pageNr: any): any;
    /**
     * query all fields using matcher and return matches
     * @param {function} matcher - function to use to filter
     * @param {object} options - query options. e.g. {inScope: true} for querying only fields that are currenttly in scope.
     * @return {array} - All matched fields in the current ExoForm schema
     */
    query(matcher: Function, options: object): any[];
    /**
     * Returns true if the given page is in scope (not descoped by active rules)
     * @param {object} p - Page object (with index numeric property)
     * @returns {boolean} - true if page is in scope
     */
    isPageInScope(p: object): boolean;
    /**
     * Get field with given name
     * @param {string} name - name of field to get
     * @return {Object} - Field
     */
    get(name: string): any;
    /**
     * Map data to form, once schema is loaded
     * @param {function} mapper - a function that will return a value per field
     * @return {object} - the current ExoForm instance
     */
    map(mapper: Function): object;
    /**
     * Submits the form
     * @param {event} ev - event object to pass onto the submit handler
     */
    submitForm(ev: Event): void;
    /**
     * Gets the current form's values
     * @return {object} - The typed data posted
     */
    getFormValues(): object;
    getFieldValue(elementOrField: any): any;
    /**
     * Renders a single ExoForm control
     * @param {object} field - field structure sub-schema.
     * @return {promise} - A promise with the typed rendered element
     */
    renderSingleControl(field: object): Promise<any>;
    createControl(f: any): Promise<any>;
    _generateUniqueElementId(): string;
    clear(): void;
}
import ExoFormDataBinding from "./ExoFormDataBinding";
