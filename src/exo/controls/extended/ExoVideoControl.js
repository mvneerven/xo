import ExoEmbedControl from './ExoEmbedControl';
import DOM from '../../../pwa/DOM';

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

export default ExoVideoControl;