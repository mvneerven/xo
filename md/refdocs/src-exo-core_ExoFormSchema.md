# Module `exo/core/ExoFormSchema`

![category:other](https://img.shields.io/badge/category-other-blue.svg?style=flat-square)



[Source file](..\..\src\exo\core\ExoFormSchema.js)

# Class `ExoFormSchema`

Hosts the XO form json/js form schema and manages its state

## Methods

### `read(value) ► ExoFormSchema`

![modifier: private](images/badges/modifier-private.svg) ![modifier: static](images/badges/modifier-static.svg)

Reads the given schema

Parameters | Type | Description
--- | --- | ---
__value__ | `Any` | *the string, JS- or JSON literal to read*
__*return*__ | [ExoFormSchema](src-exo-core_ExoFormSchema.md) | *the parsed schema*

---

### `query(matcher, options) ► array`

![modifier: private](images/badges/modifier-private.svg)

query all fields using matcher and return matches

Parameters | Type | Description
--- | --- | ---
__matcher__ | `function` | *function to use to filter*
__options__ | `object` | *query options. e.g. {inScope: true} for querying only fields that are currenttly in scope.*
__*return*__ | `array` | *- All matched fields in the current XO form schema*

---

### `update(name, schema)`

![modifier: private](images/badges/modifier-private.svg)

Updates the schema of a field in the XO form Schema in place.

Parameters | Type | Description
--- | --- | ---
__name__ | `*` | *name of the field to update*
__schema__ | `*` | *new field schema*

---

### `insertBefore(ctl, beforeCtl) ► ExoFormSchema`

![modifier: private](images/badges/modifier-private.svg)

Moves field to new position and returns the modified form schema

Parameters | Type | Description
--- | --- | ---
__ctl__ | [ExoControlBase](src-exo-controls-base_ExoControlBase.md) | *control to move to new position*
__beforeCtl__ | [ExoControlBase](src-exo-controls-base_ExoControlBase.md) | *control to insert the control before - null to append at end*
__*return*__ | [ExoFormSchema](src-exo-core_ExoFormSchema.md) | *- modified schema*

---

## Members

Name | Type | Description
--- | --- | ---
__controls__ | `undefined` | *Controls section for form navigation*
__mappings__ | `undefined` | *UI mappings - used when JSON Schema is used and only UI mapping is needed*
