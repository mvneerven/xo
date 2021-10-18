# Creating Custom XO form Controls

All XO form control classes are ES6 classes that inherit from the abstract *ExoControlBase* class, but it is more likely that you will inherit from an inherited control class.

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

XO form works with a *ExoFormContext* object that is created before any forms are rendered.

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

