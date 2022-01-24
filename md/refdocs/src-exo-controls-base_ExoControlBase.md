# Module `exo/controls/base/ExoControlBase`

![category:other](https://img.shields.io/badge/category-other-blue.svg?style=flat-square)



[Source file](..\..\src\exo\controls\base\ExoControlBase.js)

# Class `ExoControlBase`

Abstract base class for XO form controls

## Methods

### `updateSchema()`

![modifier: private](images/badges/modifier-private.svg)

Rerenders the control with the given field schema and returns a reference to the updated control.

---

### `showHelp(msg, options)`

![modifier: private](images/badges/modifier-private.svg)

Displays a help text to the user. Pass with empty @msg to hide.

Parameters | Type | Description
--- | --- | ---
__msg__ | `String` | *The message to display*
__options__ | `Object` | *The options (type: &quot;info|error|invalid&quot;)*

---

## Members

Name | Type | Description
--- | --- | ---
__jsonSchema__ | `undefined` | *Gets the control properties as a JSON schema*
__cssVariables__ | `undefined` | *Returns a reference to the CSS variables included*
__hasValue__ | `undefined` | *Returns true if the control manipulates/returns a value*
__htmlElement__ | `undefined` | *Sets the HTML element*
__useContainer__ | `undefined` | *Specifies whether XO form should use a containing DIV element to render the control.By default for instance, the button and the page control don&#x27;t use a container.*
__caption__ | `undefined` | *The control&#x27;s caption/label*
__schema__ | `undefined` | *Gets the current field schema*
__caption__ | `undefined` | *The control&#x27;s caption/label*
__dataBinding__ | `undefined` | *Returns a reference to the data binding context. Can be the parent control&#x27;s databinding context.*
__rulesEngine__ | `undefined` | *Gets the attached rules engine*
__parentControl__ | `undefined` | *Returns the parent control, when rendered as a single field in a context of another control, such as a group.*
