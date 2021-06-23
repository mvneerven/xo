# ExoForm Controls

ExoForm comes with a range of standard (html5 form element based) and extended (complex) controls, and you can roll your own.

## Syntax

```json
{
    "type": "<exoform field type>",
    "name": "<name>",
    "caption": "<label caption>"
}
```

## Standard Controls

| HTML5                         | ExoForm          | 
| ----------------------------- | ---------------- | 
| button                        | button           |
| input[type=text]              | text             |
| input[type=email]             | email            |
| input[type=search]            | search           |
| input[type=password]          | password         |
| input[type=date]              | date             |
| input[type=datetime-local]    | datetime-local   |
| input[type=time]              | time             |
| input[type=range]             | range            |
| input[type=date]              | date             |
| input[type=week]              | week             |
| input[type=tel]               | tel              |
| input[type=color]             | color            |
| input[type=hidden]            | hidden           |
| input[type=url]               | url              |
| input[type=file]              | file             | 
| textarea                      | multiline        |
| input[type=checkbox]          | checkbox         | 
| Group of input[type=checkbox] | checkboxlist     | 
| Group of input[type=radio]    | radiobuttonlist  | 

## Extended Controls

| Name                          | Description                                                          | 
| ----------------------------- | -------------------------------------------------------------------- | 
| filedrop                      | Rich file upload control with drag & drop support                    |
| switch                        | Checkbox replacement for boolean values                              |
| richtext                      | A CKEditor wysiwyg/html editor wrapper for ExoForm                   |
| tags                          | A control for adding multiple tags                                   |
| multiinput                    | Input container for collecting multiple values and display in a grid |
| creditcard                    | Implementation of multiinput for credit card registration            |
| name                          | Person name control                                                  |
| nladdress                     | Implementation of multiinput for Dutch Address input                 |
| daterange                     | Implementation of multiiput for date ranges                          |
| embed                         | Control for embedding anything in an IFrame                          |
| video                         | Control for embedding video                                          |
| captcha                       | Google ReCaptcha wrapper                                             |
| dialog                        | A simple dialog (modal or modeless)                                  |
| info                          | An info panel control                                                |
| map                           | Leaflet interactive map wrapper                                      |
| listview                      | Listview Control for tables/grids, tile views and more               |



## Deeper into ExoForm controls

An ExoForm control is a wrapper around DOM objects. Each control eventually renders a containing UI element, mostly using a standard template.

## Standard Control Template

By default, controls render usinmg this template:

```html
<div data-id="${obj.id}" class="${obj.class}" data-field-type="${obj.type}">
    <div class="exf-ctl">
        <label for="${obj.id}" aria-hidden="true" class="exf-label" title="${obj.caption}">${obj.caption}</label>
        [MAIN CONTROL ELEMENT]
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

## Creating Custom Controls

All ExoForm control classes are ES6 classes that inherit from the abstract *ExoControlBase* class, but it is more likely that you will inherit from an inherited control class.

To illustrate this, let's take the *ExoVideoControl* implementation:

```js
class ExoVideoControl extends ExoEmbedControl {

    mute = false;

    autoplay = true;

    player = "youtube";

    code = "abcdefghij";

    static players = {
        youtube: {
            url: "https://www.youtube.com/embed/{{code}}?autoplay={{autoplay}}&mute={{mute}}"
        },
        vimeo: {
            url: "https://player.vimeo.com/video/{{code}}?title=0&byline=0&portrait=0&background={{mute}}"
        }
    }

    constructor(context) {
        super(context);

        this.acceptProperties(
            { name: "code", description: "Code of the video to embed" },
            { name: "width" },
            { name: "height" },
            { name: "autoplay", type: Boolean, description: "Boolean indicating whether the video should immediately start playing" },
            { name: "mute", type: Boolean, description: "Boolean indicating whether the video should be muted" },
            { name: "player", type: String, description: "Player type. Currently implemented: youtube, vimeo" }
        )
    }

    async render() {
        const player = ExoVideoControl.players[this.player];

        this.url = DOM.format(player.url, this);
        await super.render();
        return this.container;
    }
}

```

### Registering (groups of) custom controls 

ExoForm works with a *ExoFormContext* object that is created before any forms are rendered.

```js

this.exoContext = await this.createContext();

async createContext(config) {
    const factory = xo.form.factory;

    // add group of custom controls 
    // to ExoFormFactory 
    factory.add(MyCustomControls.controls);

    return factory.build({
        defaults: {
            validation: "inline",
        },
        ...(config || {}),
    });
}

// class that declares the custom controls
class MyCustomControls {
    static controls = {
        imagecrop: { type: ExoCropControl, note: "Image cropper" },
        assetinfo: { type: ExoFileInfoControl, note: "Asset info" },
        assetselector: { type: ExoAssetSelector, note: "Asset selector" } 
    }
}
```

### Passing the context at form runtime

```js
let container = await xo.form.run("/data/forms/account.json", {
    context: this.exoContext
})
```

