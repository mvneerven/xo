# Module `pwa/PWA`

![category:other](https://img.shields.io/badge/category-other-blue.svg?style=flat-square)



[Source file](..\..\src\pwa\PWA.js)

# Class `PWA`

Progressive Web App container

## Methods

### `asyncInit() ► `

![modifier: private](images/badges/modifier-private.svg)

Called to allow the inherited class to initialize async

Parameters | Type | Description
--- | --- | ---
__*return*__ | `undefined` | *Promise*

---

### `getToken() ► `

![modifier: private](images/badges/modifier-private.svg)

Returns the JWT token to use in REST (if implemented in inherited class)

Parameters | Type | Description
--- | --- | ---
__*return*__ | `undefined` | *JWT token wrapped in promise*

---

### `routerReady()`

![modifier: private](images/badges/modifier-private.svg)

Called when all routes have been set up (asynchronously)

---

## Members

Name | Type | Description
--- | --- | ---
__restService__ | `undefined` | *Returns the REST service (using a fetch implementation)*
__UI__ | `undefined` | *Returns the UI instance for this PWA*
__router__ | `undefined` | *Returns the router instance created for the PWA.*
