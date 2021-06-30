# Module `exo/core/ExoFormSchema`

![category:other](https://img.shields.io/badge/category-other-blue.svg?style=flat-square)



[Source file](..\..\src\exo\core\ExoFormSchema.js)

# Class `ExoFormSchema`

Hosts the ExoForm json/js form schema and manages its state

## Methods

### `query(matcher, options) ► array`

![modifier: private](images/badges/modifier-private.svg)

query all fields using matcher and return matches

Parameters | Type | Description
--- | --- | ---
__matcher__ | `function` | *function to use to filter*
__options__ | `object` | *query options. e.g. {inScope: true} for querying only fields that are currenttly in scope.*
__*return*__ | `array` | *- All matched fields in the current ExoForm schema*

---

## Members

Name | Type | Description
--- | --- | ---
__controls__ | `undefined` | *Controls section for form navigation*
__mappings__ | `undefined` | *UI mappings - used when JSON Schema is used and only UI mapping is needed*
