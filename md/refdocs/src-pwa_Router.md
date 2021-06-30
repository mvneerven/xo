# Module `pwa/Router`

![category:other](https://img.shields.io/badge/category-other-blue.svg?style=flat-square)



[Source file](..\..\src\pwa\Router.js)

# Class `Router`

Hash-based PWA router

## Methods

### `listModules(filter) ► `

![modifier: private](images/badges/modifier-private.svg)

Returns an array of objects representing the router&#x27;s route modules

Parameters | Type | Description
--- | --- | ---
__filter__ | `function` | **
__*return*__ | `undefined` | *Array of objects with route module properties*

---

### `home()`

![modifier: private](images/badges/modifier-private.svg)

Navigates to the home route

---

### `generateMenu(pwaArea, filter)`

![modifier: private](images/badges/modifier-private.svg)

Generates a menu based on the provided routes and adds it to

Parameters | Type | Description
--- | --- | ---
__pwaArea__ | `Object` | *the PWA area to use*
__filter__ | `function` | *Optional function to filter menu items out*

---
