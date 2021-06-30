## Classes

<dl>
<dt><a href="#ExoButtonControl">ExoButtonControl</a></dt>
<dd><p>Renders a button</p>
</dd>
<dt><a href="#ExoCheckboxControl">ExoCheckboxControl</a></dt>
<dd><p>Renders a single checkbox</p>
</dd>
<dt><a href="#ExoCheckboxListControl">ExoCheckboxListControl</a></dt>
<dd><p>Renders a checkbox list</p>
</dd>
<dt><a href="#ExoControlBase">ExoControlBase</a></dt>
<dd><p>Abstract base class for ExoForm controls</p>
</dd>
<dt><a href="#ExoDivControl">ExoDivControl</a></dt>
<dd><p>Renders a div element</p>
</dd>
<dt><a href="#ExoDropdownListControl">ExoDropdownListControl</a></dt>
<dd><p>Renders a single select / dropdown list</p>
</dd>
<dt><a href="#ExoForm">ExoForm</a></dt>
<dd><p>ExoForm class. 
Created using ExoFormContext create() method</p>
</dd>
<dt><a href="#ExoFormContext">ExoFormContext</a></dt>
<dd><p>Hosts an ExoForm context to create forms with.
Created using {ExoFormFactory}.build()</p>
</dd>
<dt><a href="#ExoFormFactory">ExoFormFactory</a></dt>
<dd><p>Factory class for ExoForm - Used to create an ExoForm context.
Provides factory methods. Starting point for using ExoForm.</p>
</dd>
<dt><a href="#ExoFormSchema">ExoFormSchema</a></dt>
<dd><p>Hosts the ExoForm json/js form schema and manages its state</p>
</dd>
<dt><a href="#Core">Core</a></dt>
<dd><p>Core utility methods</p>
</dd>
<dt><a href="#DOM">DOM</a></dt>
<dd><p>Document Object Model helper methods</p>
</dd>
<dt><a href="#PWA_OmniBox">PWA_OmniBox</a></dt>
<dd><p>OmniBox search facility for PWAs. Use this.omniBox = new PWA.OmniBox({..}) in PWA inherited class</p>
<p>Options: </p>
<ul>
<li>categories: object containing list of categories with omnibox handling.</li>
<li>useRoutes: boolean or filter function that indicates (which) routes should be added automatically</li>
</ul>
</dd>
<dt><a href="#PWA">PWA</a></dt>
<dd><p>Progressive Web App container</p>
</dd>
<dt><a href="#RouteModule">RouteModule</a></dt>
<dd><p>Module/App that is launched on the configured PWA route</p>
</dd>
<dt><a href="#Router">Router</a></dt>
<dd><p>Hash-based PWA router</p>
</dd>
</dl>

<a name="ExoButtonControl"></a>

## ExoButtonControl
Renders a button

**Kind**: global class  
<a name="ExoCheckboxControl"></a>

## ExoCheckboxControl
Renders a single checkbox

**Kind**: global class  
<a name="ExoCheckboxListControl"></a>

## ExoCheckboxListControl
Renders a checkbox list

**Kind**: global class  
<a name="ExoControlBase"></a>

## ExoControlBase
Abstract base class for ExoForm controls

**Kind**: global class  

* [ExoControlBase](#ExoControlBase)
    * [.htmlElement](#ExoControlBase+htmlElement)
    * [.useContainer](#ExoControlBase+useContainer)
    * [.caption](#ExoControlBase+caption)
    * [.caption](#ExoControlBase+caption)
    * [.showHelp(msg, options)](#ExoControlBase+showHelp)

<a name="ExoControlBase+htmlElement"></a>

### exoControlBase.htmlElement
Sets the HTML element

**Kind**: instance property of [<code>ExoControlBase</code>](#ExoControlBase)  
<a name="ExoControlBase+useContainer"></a>

### exoControlBase.useContainer
Specifies whether ExoForm should use a containing DIV element to render the control.By default for instance, the button and the page control don't use a container.

**Kind**: instance property of [<code>ExoControlBase</code>](#ExoControlBase)  
<a name="ExoControlBase+caption"></a>

### exoControlBase.caption
The control's caption/label

**Kind**: instance property of [<code>ExoControlBase</code>](#ExoControlBase)  
<a name="ExoControlBase+caption"></a>

### exoControlBase.caption
The control's caption/label

**Kind**: instance property of [<code>ExoControlBase</code>](#ExoControlBase)  
<a name="ExoControlBase+showHelp"></a>

### exoControlBase.showHelp(msg, options)
Displays a help text to the user. Pass with empty @msg to hide.

**Kind**: instance method of [<code>ExoControlBase</code>](#ExoControlBase)  

| Param | Type | Description |
| --- | --- | --- |
| msg | <code>String</code> | The message to display |
| options | <code>Object</code> | The options (type: "info|error|invalid") |

<a name="ExoDivControl"></a>

## ExoDivControl
Renders a div element

**Kind**: global class  
<a name="ExoDropdownListControl"></a>

## ExoDropdownListControl
Renders a single select / dropdown list

**Kind**: global class  
<a name="ExoForm"></a>

## ExoForm
ExoForm class. Created using ExoFormContext create() method

**Kind**: global class  

* [ExoForm](#ExoForm)
    * [.dataBinding](#ExoForm+dataBinding) ⇒ <code>object</code>
    * [.load(schema)](#ExoForm+load) ⇒ <code>Promise</code>
    * [.loadSchema(schema)](#ExoForm+loadSchema) ⇒ <code>any</code>
    * [.renderForm()](#ExoForm+renderForm)
    * [.query(matcher, options)](#ExoForm+query) ⇒ <code>array</code>
    * [.isPageInScope(p)](#ExoForm+isPageInScope) ⇒ <code>boolean</code>
    * [.get(name)](#ExoForm+get) ⇒ <code>Object</code>
    * [.map(mapper)](#ExoForm+map) ⇒ <code>object</code>
    * [.submitForm(ev)](#ExoForm+submitForm)
    * [.getFormValues()](#ExoForm+getFormValues) ⇒ <code>object</code>
    * [.renderSingleControl(field)](#ExoForm+renderSingleControl) ⇒ <code>promise</code>

<a name="ExoForm+dataBinding"></a>

### exoForm.dataBinding ⇒ <code>object</code>
Gets the data binding object

**Kind**: instance property of [<code>ExoForm</code>](#ExoForm)  
**Returns**: <code>object</code> - - The ExoFormDataBinding instance associated with the form.  
<a name="ExoForm+load"></a>

### exoForm.load(schema) ⇒ <code>Promise</code>
load ExoForm schema (string or )

**Kind**: instance method of [<code>ExoForm</code>](#ExoForm)  
**Returns**: <code>Promise</code> - - A Promise returning the ExoForm Object with the loaded schema  

| Param | Type | Description |
| --- | --- | --- |
| schema | <code>any</code> | A JSON ExoForm Schema string or object, or URL to fetch it from. |

<a name="ExoForm+loadSchema"></a>

### exoForm.loadSchema(schema) ⇒ <code>any</code>
load ExoForm schema from object

**Kind**: instance method of [<code>ExoForm</code>](#ExoForm)  
**Returns**: <code>any</code> - - the loaded schema  

| Param | Type | Description |
| --- | --- | --- |
| schema | <code>any</code> | A JSON ExoForm Schema object. |

<a name="ExoForm+renderForm"></a>

### exoForm.renderForm()
Render ExoForm schema into a formReturns a Promise

**Kind**: instance method of [<code>ExoForm</code>](#ExoForm)  
<a name="ExoForm+query"></a>

### exoForm.query(matcher, options) ⇒ <code>array</code>
query all fields using matcher and return matches

**Kind**: instance method of [<code>ExoForm</code>](#ExoForm)  
**Returns**: <code>array</code> - - All matched fields in the current ExoForm schema  

| Param | Type | Description |
| --- | --- | --- |
| matcher | <code>function</code> | function to use to filter |
| options | <code>object</code> | query options. e.g. {inScope: true} for querying only fields that are currenttly in scope. |

<a name="ExoForm+isPageInScope"></a>

### exoForm.isPageInScope(p) ⇒ <code>boolean</code>
Returns true if the given page is in scope (not descoped by active rules)

**Kind**: instance method of [<code>ExoForm</code>](#ExoForm)  
**Returns**: <code>boolean</code> - - true if page is in scope  

| Param | Type | Description |
| --- | --- | --- |
| p | <code>object</code> | Page object (with index numeric property) |

<a name="ExoForm+get"></a>

### exoForm.get(name) ⇒ <code>Object</code>
Get field with given name

**Kind**: instance method of [<code>ExoForm</code>](#ExoForm)  
**Returns**: <code>Object</code> - - Field  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | name of field to get |

<a name="ExoForm+map"></a>

### exoForm.map(mapper) ⇒ <code>object</code>
Map data to form, once schema is loaded

**Kind**: instance method of [<code>ExoForm</code>](#ExoForm)  
**Returns**: <code>object</code> - - the current ExoForm instance  

| Param | Type | Description |
| --- | --- | --- |
| mapper | <code>function</code> | a function that will return a value per field |

<a name="ExoForm+submitForm"></a>

### exoForm.submitForm(ev)
Submits the form

**Kind**: instance method of [<code>ExoForm</code>](#ExoForm)  

| Param | Type | Description |
| --- | --- | --- |
| ev | <code>event</code> | event object to pass onto the submit handler |

<a name="ExoForm+getFormValues"></a>

### exoForm.getFormValues() ⇒ <code>object</code>
Gets the current form's values

**Kind**: instance method of [<code>ExoForm</code>](#ExoForm)  
**Returns**: <code>object</code> - - The typed data posted  
<a name="ExoForm+renderSingleControl"></a>

### exoForm.renderSingleControl(field) ⇒ <code>promise</code>
Renders a single ExoForm control

**Kind**: instance method of [<code>ExoForm</code>](#ExoForm)  
**Returns**: <code>promise</code> - - A promise with the typed rendered element  

| Param | Type | Description |
| --- | --- | --- |
| field | <code>object</code> | field structure sub-schema. |

<a name="ExoFormContext"></a>

## ExoFormContext
Hosts an ExoForm context to create forms with.Created using {ExoFormFactory}.build()

**Kind**: global class  
<a name="ExoFormContext+query"></a>

### exoFormContext.query() ⇒ <code>Array</code>
Searches the control library using @param {Function} callback.

**Kind**: instance method of [<code>ExoFormContext</code>](#ExoFormContext)  
**Returns**: <code>Array</code> - - list of matched controls.  
<a name="ExoFormFactory"></a>

## ExoFormFactory
Factory class for ExoForm - Used to create an ExoForm context.Provides factory methods. Starting point for using ExoForm.

**Kind**: global class  

* [ExoFormFactory](#ExoFormFactory)
    * [.build()](#ExoFormFactory.build)
    * [.determineSchemaType(value)](#ExoFormFactory.determineSchemaType) ⇒ <code>String</code>
    * [.run(value, options)](#ExoFormFactory.run) ⇒
    * [.readJSONSchema(schemaUrl)](#ExoFormFactory.readJSONSchema) ⇒ <code>Object</code>

<a name="ExoFormFactory.build"></a>

### ExoFormFactory.build()
Build {ExoFormContext} instance.

**Kind**: static method of [<code>ExoFormFactory</code>](#ExoFormFactory)  
<a name="ExoFormFactory.determineSchemaType"></a>

### ExoFormFactory.determineSchemaType(value) ⇒ <code>String</code>
Determines the ExoForm schema type from an object.

**Kind**: static method of [<code>ExoFormFactory</code>](#ExoFormFactory)  
**Returns**: <code>String</code> - - the detected type ("field", "json-schema" or "form")  

| Param | Type |
| --- | --- |
| value | <code>Object</code> | 

<a name="ExoFormFactory.run"></a>

### ExoFormFactory.run(value, options) ⇒
Run a form directly and return generated container

**Kind**: static method of [<code>ExoFormFactory</code>](#ExoFormFactory)  
**Returns**: div element (form container element div.exf-container)  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | JS/JSON schema or a URL to fetch it from. |
| options | <code>\*</code> | Object containing options  - context: ExoFormContext - on: object with event listeners    e.g.    xo.form.run(schema, {     on: {       post: e => {         // handle post       }     }   }) - for DOM event listening, use (on: {dom: {change: e => { ... }}})   xo.form.run(schema, {     on: {       post: e => {         // handle post       },       dom: {         change: e => {           // handle change event         }       }     }   }) |

<a name="ExoFormFactory.readJSONSchema"></a>

### ExoFormFactory.readJSONSchema(schemaUrl) ⇒ <code>Object</code>
Read JSON Schema from the given URL.

**Kind**: static method of [<code>ExoFormFactory</code>](#ExoFormFactory)  
**Returns**: <code>Object</code> - - JSON Schema Object  

| Param | Type | Description |
| --- | --- | --- |
| schemaUrl | <code>URL</code> | The URL to read the JSON Schema from |

<a name="ExoFormSchema"></a>

## ExoFormSchema
Hosts the ExoForm json/js form schema and manages its state

**Kind**: global class  

* [ExoFormSchema](#ExoFormSchema)
    * [.controls](#ExoFormSchema+controls)
    * [.mappings](#ExoFormSchema+mappings)
    * [.query(matcher, options)](#ExoFormSchema+query) ⇒ <code>array</code>

<a name="ExoFormSchema+controls"></a>

### exoFormSchema.controls
Controls section for form navigation

**Kind**: instance property of [<code>ExoFormSchema</code>](#ExoFormSchema)  
<a name="ExoFormSchema+mappings"></a>

### exoFormSchema.mappings
UI mappings - used when JSON Schema is used and only UI mapping is needed

**Kind**: instance property of [<code>ExoFormSchema</code>](#ExoFormSchema)  
<a name="ExoFormSchema+query"></a>

### exoFormSchema.query(matcher, options) ⇒ <code>array</code>
query all fields using matcher and return matches

**Kind**: instance method of [<code>ExoFormSchema</code>](#ExoFormSchema)  
**Returns**: <code>array</code> - - All matched fields in the current ExoForm schema  

| Param | Type | Description |
| --- | --- | --- |
| matcher | <code>function</code> | function to use to filter |
| options | <code>object</code> | query options. e.g. {inScope: true} for querying only fields that are currenttly in scope. |

<a name="Core"></a>

## Core
Core utility methods

**Kind**: global class  

* [Core](#Core)
    * [.fingerprint()](#Core.fingerprint) ⇒ <code>String</code>
    * [.getObjectValue(obj, path, def)](#Core.getObjectValue) ⇒
    * [.stringifyJs(jsLiteral, replacer, indent)](#Core.stringifyJs) ⇒
    * [.scopeEval(scope, script)](#Core.scopeEval) ⇒
    * [.isUrl(txt)](#Core.isUrl) ⇒
    * [.setObjectValue(obj, path, value)](#Core.setObjectValue)
    * [.stringToPath(path)](#Core.stringToPath) ⇒
    * [.compare(operator, a, b)](#Core.compare) ⇒
    * [.guid()](#Core.guid) ⇒
    * [.waitFor(f, timeoutMs, intervalMs)](#Core.waitFor) ⇒
    * [.formatByteSize(size)](#Core.formatByteSize) ⇒

<a name="Core.fingerprint"></a>

### Core.fingerprint() ⇒ <code>String</code>
Generates a device fingerprint based on rendering data on a canvas element - See https://en.wikipedia.org/wiki/Canvas_fingerprinting

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: <code>String</code> - - An identifier known to be relatively unique per device  
<a name="Core.getObjectValue"></a>

### Core.getObjectValue(obj, path, def) ⇒
**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: The value of the property as retrieved  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>Object</code> | the object to get a property from |
| path | <code>String</code> | path to the property |
| def | <code>Any</code> | default to return if the property is undefined |

<a name="Core.stringifyJs"></a>

### Core.stringifyJs(jsLiteral, replacer, indent) ⇒
Does JS code stringification comparable to JSON.stringify()

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: String  

| Param | Type | Description |
| --- | --- | --- |
| jsLiteral | <code>Object</code> | the JavaScript literal to stringify |
| replacer | <code>function</code> |  |
| indent | <code>Number</code> |  |

<a name="Core.scopeEval"></a>

### Core.scopeEval(scope, script) ⇒
Evaluates a script in the given scope

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: The return value of the script, if any  

| Param | Type | Description |
| --- | --- | --- |
| scope | <code>Object</code> | the 'this' scope for the script to run in |
| script | <code>String</code> | the script to execute |

<a name="Core.isUrl"></a>

### Core.isUrl(txt) ⇒
Checks whether the fiven string is a valid URL.

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: Boolean indeicating whether the string is a URL.  

| Param | Type | Description |
| --- | --- | --- |
| txt | <code>String</code> | the string to evaluate |

<a name="Core.setObjectValue"></a>

### Core.setObjectValue(obj, path, value)
Counterpart of GetObjectValue

**Kind**: static method of [<code>Core</code>](#Core)  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>Object</code> | the object to set a shallow or deep property on |
| path | <code>String</code> | the path to the property to set |
| value | <code>Any</code> | the value to set |

<a name="Core.stringToPath"></a>

### Core.stringToPath(path) ⇒
Helper for GetObjectProperty and GetObjectProperty

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: Array  

| Param | Type |
| --- | --- |
| path | <code>String</code> | 

<a name="Core.compare"></a>

### Core.compare(operator, a, b) ⇒
Compares values using the built in operator table

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: Boolean  

| Param | Type |
| --- | --- |
| operator | <code>String</code> | 
| a | <code>Object</code> | 
| b | <code>Object</code> | 

<a name="Core.guid"></a>

### Core.guid() ⇒
Returns a random GUID

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: string (36 characters)  
<a name="Core.waitFor"></a>

### Core.waitFor(f, timeoutMs, intervalMs) ⇒
Waits for a given condition in a promise.

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: Promise that resolves when the evaluating function provided return true, or gets rejected when the timeout is reached.  

| Param | Type | Description |
| --- | --- | --- |
| f | <code>function</code> | the function to evaluate whether waiting should end |
| timeoutMs | <code>Number</code> | total time to wait if the given function still doesn't return true |
| intervalMs | <code>Number</code> | interval to wait between each function evaluation (in milliseconds) - Defaults to 20. |

<a name="Core.formatByteSize"></a>

### Core.formatByteSize(size) ⇒
Formats a number as human-friendly byte size

**Kind**: static method of [<code>Core</code>](#Core)  
**Returns**: String like 20KB, 1.25MB, 6.25GB, etc.  

| Param | Type |
| --- | --- |
| size | <code>Number</code> | 

<a name="DOM"></a>

## DOM
Document Object Model helper methods

**Kind**: global class  

* [DOM](#DOM)
    * [.parseHTML(html)](#DOM.parseHTML) ⇒
    * [.elementToString(el)](#DOM.elementToString) ⇒

<a name="DOM.parseHTML"></a>

### DOM.parseHTML(html) ⇒
Generates an Html Element from the given HTML string

**Kind**: static method of [<code>DOM</code>](#DOM)  
**Returns**: DOM element  

| Param | Type |
| --- | --- |
| html | <code>String</code> | 

<a name="DOM.elementToString"></a>

### DOM.elementToString(el) ⇒
Returns string representation of HtmlElement using nodeName, id and classes

**Kind**: static method of [<code>DOM</code>](#DOM)  
**Returns**: String  

| Param | Type | Description |
| --- | --- | --- |
| el | <code>Object</code> | the DOMM element |

<a name="PWA_OmniBox"></a>

## PWA\_OmniBox
OmniBox search facility for PWAs. Use this.omniBox = new PWA.OmniBox({..}) in PWA inherited classOptions: - categories: object containing list of categories with omnibox handling.- useRoutes: boolean or filter function that indicates (which) routes should be added automatically

**Kind**: global class  
<a name="PWA"></a>

## PWA
Progressive Web App container

**Kind**: global class  

* [PWA](#PWA)
    * [new PWA(options)](#new_PWA_new)
    * [.restService](#PWA+restService)
    * [.UI](#PWA+UI)
    * [.router](#PWA+router)
    * [.asyncInit()](#PWA+asyncInit) ⇒
    * [.getToken()](#PWA+getToken) ⇒
    * [.routerReady()](#PWA+routerReady)

<a name="new_PWA_new"></a>

### new PWA(options)
Constructor


| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | sets up the PWA |

<a name="PWA+restService"></a>

### pwA.restService
Returns the REST service (using a fetch implementation)

**Kind**: instance property of [<code>PWA</code>](#PWA)  
<a name="PWA+UI"></a>

### pwA.UI
Returns the UI instance for this PWA

**Kind**: instance property of [<code>PWA</code>](#PWA)  
<a name="PWA+router"></a>

### pwA.router
Returns the router instance created for the PWA.

**Kind**: instance property of [<code>PWA</code>](#PWA)  
<a name="PWA+asyncInit"></a>

### pwA.asyncInit() ⇒
Called to allow the inherited class to initialize async

**Kind**: instance method of [<code>PWA</code>](#PWA)  
**Returns**: Promise  
<a name="PWA+getToken"></a>

### pwA.getToken() ⇒
Returns the JWT token to use in REST (if implemented in inherited class)

**Kind**: instance method of [<code>PWA</code>](#PWA)  
**Returns**: JWT token wrapped in promise  
<a name="PWA+routerReady"></a>

### pwA.routerReady()
Called when all routes have been set up (asynchronously)

**Kind**: instance method of [<code>PWA</code>](#PWA)  
<a name="RouteModule"></a>

## RouteModule
Module/App that is launched on the configured PWA route

**Kind**: global class  
<a name="Router"></a>

## Router
Hash-based PWA router

**Kind**: global class  

* [Router](#Router)
    * [.listModules(filter)](#Router+listModules) ⇒
    * [.home()](#Router+home)
    * [.generateMenu(pwaArea, filter)](#Router+generateMenu)

<a name="Router+listModules"></a>

### router.listModules(filter) ⇒
Returns an array of objects representing the router's route modules

**Kind**: instance method of [<code>Router</code>](#Router)  
**Returns**: Array of objects with route module properties  

| Param | Type |
| --- | --- |
| filter | <code>function</code> | 

<a name="Router+home"></a>

### router.home()
Navigates to the home route

**Kind**: instance method of [<code>Router</code>](#Router)  
<a name="Router+generateMenu"></a>

### router.generateMenu(pwaArea, filter)
Generates a menu based on the provided routes and adds it to

**Kind**: instance method of [<code>Router</code>](#Router)  

| Param | Type | Description |
| --- | --- | --- |
| pwaArea | <code>Object</code> | the PWA area to use |
| filter | <code>function</code> | Optional function to filter menu items out |

