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
