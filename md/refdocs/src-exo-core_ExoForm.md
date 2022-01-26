# Module `exo/core/ExoForm`

![category:other](https://img.shields.io/badge/category-other-blue.svg?style=flat-square)



[Source file](..\..\src\exo\core\ExoForm.js)

# Class `ExoForm`

XO form class. Created using ExoFormContext create() method

## Methods

### `load(schema) ► Promise`

![modifier: private](images/badges/modifier-private.svg)

load XO form schema (string or )

Parameters | Type | Description
--- | --- | ---
__schema__ | `any` | *A JSON/JS XO form Schema string or object, or URL to fetch it from.*
__*return*__ | `Promise` | *- A Promise returning the XO form Object with the loaded schema*

---

### `loadSchema(schema) ► any`

![modifier: private](images/badges/modifier-private.svg)

load XO form schema from object

Parameters | Type | Description
--- | --- | ---
__schema__ | `any` | *A JSON/JS XO form Schema object.*
__*return*__ | `any` | *- the loaded schema*

---

### `renderForm()`

![modifier: private](images/badges/modifier-private.svg)

Render ExoForm schema into a formReturns a Promise

---

### `isPageInScope(p) ► boolean`

![modifier: private](images/badges/modifier-private.svg)

Returns true if the given page is in scope (not descoped by active rules)

Parameters | Type | Description
--- | --- | ---
__p__ | `object` | *Page object (with index numeric property)*
__*return*__ | `boolean` | *- true if page is in scope*

---

### `get(data) ► Object`

![modifier: private](images/badges/modifier-private.svg)

Get control with given name or from element

Parameters | Type | Description
--- | --- | ---
__data__ | `string` | *name of field to get, or HTML element*
__*return*__ | `Object` | *- Control*

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

### `getInstance(name) ► Object`

![modifier: private](images/badges/modifier-private.svg)

Shortcut to instance in databinding models

Parameters | Type | Description
--- | --- | ---
__name__ | `*` | **
__*return*__ | `Object` | **

---

## Members

Name | Type | Description
--- | --- | ---
__schema__ | `undefined` | *Returns the current Form Schema*
__dataBinding__ | `object` | *Gets the data binding object*
