# Module `exo/core/ExoFormFactory`

![category:other](https://img.shields.io/badge/category-other-blue.svg?style=flat-square)



[Source file](..\..\src\exo\core\ExoFormFactory.js)

# Class `ExoFormFactory`

Factory class for ExoForm - Used to create an ExoForm context.Provides factory methods. Starting point for using ExoForm.

## Methods

### `build()`

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Build {ExoFormContext} instance.

---

### `extractControlMeta(library) ► Array`

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Generates meta documentation about all controls in the given control library.

Parameters | Type | Description
--- | --- | ---
__library__ | `Object` | **
__*return*__ | `Array` | *- Array containing control metadata.*

---

### `all() ► Object`

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Generates an ExoForm schema with all available controls

Parameters | Type | Description
--- | --- | ---
__*return*__ | `Object` | *- ExoForm schema*

---

### `read(value, options) ► ExoFormSchema`

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Loads and parses an ExoForm schema from the given source

Parameters | Type | Description
--- | --- | ---
__value__ | `*` | *Object, string, URL*
__options__ | `*` | *options*
__*return*__ | [ExoFormSchema](src-exo-core_ExoFormSchema.md) | **

---

### `determineSchemaType(value) ► String`

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Determines the ExoForm schema type from an object.

Parameters | Type | Description
--- | --- | ---
__value__ | `Object` | **
__*return*__ | `String` | *- the detected type (&quot;field&quot;, &quot;json-schema&quot; or &quot;form&quot;)*

---

### `run(value, options) ► `

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Run a form directly and return generated container

Parameters | Type | Description
--- | --- | ---
__value__ | `*` | *JS/JSON schema or a URL to fetch it from.*
__options__ | `*` | *Object containing options - context: ExoFormContext- on: object with event listeners   e.g.   xo.form.run(schema, {    on: {      post: e &#x3D;&gt; {        // handle post      }    }  })- for DOM event listening, use (on: {dom: {change: e &#x3D;&gt; { ... }}})  xo.form.run(schema, {    on: {      post: e &#x3D;&gt; {        // handle post      },      dom: {        change: e &#x3D;&gt; {          // handle change event        }      }    }  })*
__*return*__ | `undefined` | *div element (form container element div.exf-container)*

---

### `readJSONSchema(schemaUrl) ► Object`

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Read JSON Schema from the given URL.

Parameters | Type | Description
--- | --- | ---
__schemaUrl__ | `URL` | *The URL to read the JSON Schema from*
__*return*__ | `Object` | *- JSON Schema Object*

---
