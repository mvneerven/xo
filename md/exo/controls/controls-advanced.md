# Deeper into ExoForm controls

An ExoForm control is a wrapper around DOM objects. Each control eventually renders a containing UI element, mostly using a standard template.

## Standard Control Template

By default, controls render using this template:

```html
<div data-id="@id" class="@class" data-field-type="@type">
    <div class="exf-ctl">
        <label for="@id" aria-hidden="true" class="exf-label" title="@caption">@caption</label>
        @main-element
    </div>
    <div class="exf-fld-details">
        <div class="exf-help-wrapper"></div>
    </div>
</div>
```

By setting the *useContainer* property to *false*, you can suppress container creation.

This is done by *button* and *fieldset*, for instance.

## ExoForm Control Lifecycle

When an ExoForm schema is parsed, controls are created from each element in *pages*, *fields* and *controls*. The declarative JSON/JS Object Notation schema properties are then mapped to control properties.

During form runtime, control state can be modified by users, interdependencies between controls, datamodel dependencies, etc. Translating this control state into DOM state (classes, attributes, etc.) is the responsibility of each control. This is where inheritance takes care of a lot. The *ExoControlBase* base class, for example, handles a lot, but if you're building a complex control with a lot of stuff that the base class doesn't know of, you need to take care of state keeping yourself.

ExoForm manages the ExoForm control and DOM element relation, by keeping a reference to the corresponding *field* in DOMElement.data, so you can do this:

```js
var f = xo.form.factory.getFieldFromElement(domElm);
let ctl = f._control;
```

---

- [Using and Extending ExoForm in JavaScript](../using-xo-javascript.md)
  