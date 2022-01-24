import ExoBaseControls from '../base';
import DOM from '../../../pwa/DOM';
import xo from '../../../../js/xo';

class ExoCaptchaControl extends ExoBaseControls.controls.div.type {

    constructor() {
        super(...arguments);
        this._hasValue = true;
        this.acceptProperties(
            {
                name: "sitekey",
                type: String,
                description: "Key for Google reCaptcha",
                more: "https://developers.google.com/recaptcha/intro"
            }
        )
    }

    async render() {
        await super.render();

        const me = this;

        this.context.exo.prePost = async () => {
            return await grecaptcha.execute(me.sitekey, { action: 'submit' })
        }

        return new Promise(resolve => {
            DOM.require(`https://www.google.com/recaptcha/api.js?render=${this.sitekey}`, e => {
                grecaptcha.ready(() => {
                    resolve(this.htmlElement);
                })
            });

        })
    }

    set sitekey(value) {
        this._sitekey = value;
    }

    get sitekey() {
        return this._sitekey;
    }
}

export default ExoCaptchaControl;