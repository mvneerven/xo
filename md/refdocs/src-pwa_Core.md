# Module `pwa/Core`

![category:test](https://img.shields.io/badge/category-test-blue.svg?style=flat-square)



[Source file](..\..\src\pwa\Core.js)

# Class `Core`

Core utility methods

## Methods

### `fingerprint() ► String`

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Generates a device fingerprint based on rendering data on a canvas element - See https://en.wikipedia.org/wiki/Canvas_fingerprinting

Parameters | Type | Description
--- | --- | ---
__*return*__ | `String` | *- An identifier known to be relatively unique per device*

---

### `getObjectValue(obj, path, def) ► `

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)



Parameters | Type | Description
--- | --- | ---
__obj__ | `Object` | *the object to get a property from*
__path__ | `String` | *path to the property*
__def__ | `Any` | *default to return if the property is undefined*
__*return*__ | `undefined` | *The value of the property as retrieved*

---

### `stringifyJs(jsLiteral, replacer, indent) ► `

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Does JS code stringification comparable to JSON.stringify()

Parameters | Type | Description
--- | --- | ---
__jsLiteral__ | `Object` | *the JavaScript literal to stringify*
__replacer__ | `function` | **
__indent__ | `Number` | **
__*return*__ | `undefined` | *String*

---

### `scopeEval(scope, script) ► `

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Evaluates a script in the given scope

Parameters | Type | Description
--- | --- | ---
__scope__ | `Object` | *the &#x27;this&#x27; scope for the script to run in*
__script__ | `String` | *the script to execute*
__*return*__ | `undefined` | *The return value of the script, if any*

---

### `isUrl(txt) ► `

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Checks whether the fiven string is a valid URL.

Parameters | Type | Description
--- | --- | ---
__txt__ | `String` | *the string to evaluate*
__*return*__ | `undefined` | *Boolean indeicating whether the string is a URL.*

---

### `setObjectValue(obj, path, value)`

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Counterpart of GetObjectValue

Parameters | Type | Description
--- | --- | ---
__obj__ | `Object` | *the object to set a shallow or deep property on*
__path__ | `String` | *the path to the property to set*
__value__ | `Any` | *the value to set*

---

### `stringToPath(path) ► `

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Helper for GetObjectProperty and GetObjectProperty

Parameters | Type | Description
--- | --- | ---
__path__ | `String` | **
__*return*__ | `undefined` | *Array*

---

### `compare(operator, a, b) ► `

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Compares values using the built in operator table

Parameters | Type | Description
--- | --- | ---
__operator__ | `String` | **
__a__ | `Object` | **
__b__ | `Object` | **
__*return*__ | `undefined` | *Boolean*

---

### `guid() ► `

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Returns a random GUID

Parameters | Type | Description
--- | --- | ---
__*return*__ | `undefined` | *string (36 characters)*

---

### `waitFor(f, timeoutMs, intervalMs) ► `

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Waits for a given condition in a promise.

Parameters | Type | Description
--- | --- | ---
__f__ | `function` | *the function to evaluate whether waiting should end*
__timeoutMs__ | `Number` | *total time to wait if the given function still doesn&#x27;t return true*
__intervalMs__ | `Number` | *interval to wait between each function evaluation (in milliseconds) - Defaults to 20.*
__*return*__ | `undefined` | *Promise that resolves when the evaluating function provided return true, or gets rejected when the timeout is reached.*

---

### `formatByteSize(size) ► `

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Formats a number as human-friendly byte size

Parameters | Type | Description
--- | --- | ---
__size__ | `Number` | **
__*return*__ | `undefined` | *String like 20KB, 1.25MB, 6.25GB, etc.*

---
