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
