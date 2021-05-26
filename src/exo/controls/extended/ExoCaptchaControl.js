import ExoBaseControls from '../base/ExoBaseControls';
import DOM from '../../../pwa/DOM';

class ExoCaptchaControl extends ExoBaseControls.controls.div.type {

    constructor(context) {
        super(context);

        DOM.require("https://www.google.com/recaptcha/api.js");

        this.acceptProperties({
            name: "sitekey",
            type: String,
            description: "Key for Google reCaptcha",
            more: "https://developers.google.com/recaptcha/intro"
        },
            {
                name: "invisible",
                type: Boolean,
                description: "Use invisible Captcha method",
                more: "https://developers.google.com/recaptcha/docs/invisible"
            }
        )
    }

    async render() {

        this.htmlElement.classList.add("g-recaptcha");

        this.htmlElement.setAttribute("data-sitekey", this.sitekey)

        if (this.invisible) {
            this.htmlElement.setAttribute("data-size", "invisible");
        }

        return this.htmlElement
    }

    set sitekey(value) {
        this._sitekey = value;
    }

    get sitekey() {
        return this._sitekey;
    }

    get invisible() {
        return this._invisible === true;
    }

    set invisible(value) {
        this._invisible = (value == true);
    }
}

export default ExoCaptchaControl;