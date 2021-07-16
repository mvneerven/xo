# Module `pwa/DOM`

![category:other](https://img.shields.io/badge/category-other-blue.svg?style=flat-square)



[Source file](..\..\src\pwa\DOM.js)

# Class `DOM`

Document Object Model helper methods

## Methods

### `parseHTML(html) ► `

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Generates an Html Element from the given HTML string

Parameters | Type | Description
--- | --- | ---
__html__ | `String` | **
__*return*__ | `undefined` | *DOM element*

---

### `elementToString(el) ► `

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Returns string representation of HtmlElement using nodeName, id and classes

Parameters | Type | Description
--- | --- | ---
__el__ | `Object` | *the DOMM element*
__*return*__ | `undefined` | *String*

---

### `locateText(text, options)`

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Locates text in page, scrolls to it and highlights it

Parameters | Type | Description
--- | --- | ---
__text__ | `*` | *text to find*
__options__ | `*` | *{root: document, selector: &#x27;*&#x27;, caseSensitive: false}*

---

### `isPropertyAttr(element, propertyName) ► Boolean`

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Checks whether the given attribute reflects a native property on the given element

Parameters | Type | Description
--- | --- | ---
__element__ | `*` | *the element*
__propertyName__ | `*` | *the property to test*
__*return*__ | `Boolean` | *- true if the attribute reflects a native property on the given element*

---

### `showDialog(options) ► Object`

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Creates and opens a dialog with the given options.

Parameters | Type | Description
--- | --- | ---
__options__ | `Object` | **
__*return*__ | `Object` | *dialog control*

---

### `inputTypeExists(type) ► Boolean`

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Check whether the given type is a valid HTML input type attribute

Parameters | Type | Description
--- | --- | ---
__type__ | `*` | *the type to check*
__*return*__ | `Boolean` | *true if the given type is a valid HTML input type attribute*

---
