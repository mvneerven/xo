# Module `exo/core/ExoForm`

![category:other](https://img.shields.io/badge/category-other-blue.svg?style=flat-square)



[Source file](..\..\src\exo\core\ExoForm.js)

# Class `ExoForm`

ExoForm class. Created using ExoFormContext create() method

## Methods

### `load(schema) ► Promise`

![modifier: private](images/badges/modifier-private.svg)

load ExoForm schema (string or )

Parameters | Type | Description
--- | --- | ---
__schema__ | `any` | *A JSON ExoForm Schema string or object, or URL to fetch it from.*
__*return*__ | `Promise` | *- A Promise returning the ExoForm Object with the loaded schema*

---

### `loadSchema(schema) ► any`

![modifier: private](images/badges/modifier-private.svg)

load ExoForm schema from object

Parameters | Type | Description
--- | --- | ---
__schema__ | `any` | *A JSON ExoForm Schema object.*
__*return*__ | `any` | *- the loaded schema*

---

### `renderForm()`

![modifier: private](images/badges/modifier-private.svg)

Render ExoForm schema into a formReturns a Promise

---

### `query(matcher, options) ► array`

![modifier: private](images/badges/modifier-private.svg)

query all fields using matcher and return matches

Parameters | Type | Description
--- | --- | ---
__matcher__ | `function` | *function to use to filter*
__options__ | `object` | *query options. e.g. {inScope: true} for querying only fields that are currenttly in scope.*
__*return*__ | `array` | *- All matched fields in the current ExoForm schema*

---

### `isPageInScope(p) ► boolean`

![modifier: private](images/badges/modifier-private.svg)

Returns true if the given page is in scope (not descoped by active rules)

Parameters | Type | Description
--- | --- | ---
__p__ | `object` | *Page object (with index numeric property)*
__*return*__ | `boolean` | *- true if page is in scope*

---

### `get(name) ► Object`

![modifier: private](images/badges/modifier-private.svg)

Get field with given name

Parameters | Type | Description
--- | --- | ---
__name__ | `string` | *name of field to get*
__*return*__ | `Object` | *- Field*

---

### `map(mapper) ► object`

![modifier: private](images/badges/modifier-private.svg)

Map data to form, once schema is loaded

Parameters | Type | Description
--- | --- | ---
__mapper__ | `function` | *a function that will return a value per field*
__*return*__ | `object` | *- the current ExoForm instance*

---

### `submitForm(ev)`

![modifier: private](images/badges/modifier-private.svg)

Submits the form

Parameters | Type | Description
--- | --- | ---
__ev__ | `event` | *event object to pass onto the submit handler*

---

### `getFormValues() ► object`

![modifier: private](images/badges/modifier-private.svg)

Gets the current form&#x27;s values

Parameters | Type | Description
--- | --- | ---
__*return*__ | `object` | *- The typed data posted*

---

### `renderSingleControl(field) ► promise`

![modifier: private](images/badges/modifier-private.svg)

Renders a single ExoForm control

Parameters | Type | Description
--- | --- | ---
__field__ | `object` | *field structure sub-schema.*
__*return*__ | `promise` | *- A promise with the typed rendered element*

---

## Members

Name | Type | Description
--- | --- | ---
__dataBinding__ | `object` | *Gets the data binding object*
