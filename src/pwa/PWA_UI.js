
import PWA_Notifications from './PWA_Notifications';
import PWA_Area from './PWA_Area';
import DOM from '../pwa/DOM';

class PWA_UI {
    _dirtyMessage = 'If you continue your changes will not be saved.';
    _dirty = false;

    areas = {};

    notifications = new PWA_Notifications(this);

    constructor(pwa) {
        const _ = this;
        this.pwa = pwa;

        this.html = document.querySelector("html");

        if (this.pwa.id) {
            this.html.setAttribute("id", this.pwa.id);
        }

        this.pwa.config.UI.user = {
            prefersDarkScheme: window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)").matches : false,
            currentTheme: localStorage.getItem("theme") || "light"
        }

        if (!this.pwa.config.UI.allowUserSelection) {
            this.html.classList.add("no-user-select");
        }

        if ('ontouchstart' in window) {
            this.html.classList.add('pwa-touch');
        }

        if (this.forceTheme) {
            this.theme = this.forceTheme;
        }
        else {
            if (this.pwa.config.UI.user.currentTheme === undefined) {
                this.theme = this.pwa.config.UI.user.prefersDarkScheme ? "dark" : "light";
            }
            else {
                this.theme = this.pwa.config.UI.user.currentTheme;
            }
        }

        window.addEventListener("beforeunload", function (event) {
            // Cancel the event as stated by the standard.
            event.preventDefault();
            // Chrome requires returnValue to be set.

            if (!_.dirty)
                delete event['returnValue'];
            else {
                event.returnValue = '';
            }
        });
        this._setAreas();
    }

    set dirty(value) {
        this._dirty = true;
    }

    get dirty() {
        return this._dirty;
    }

    _setAreas() {
        let ar = document.querySelectorAll("[data-pwa-area]");

        if (!ar.length)
            throw "No PWA areas defined";

        ar.forEach(element => {
            var areaName = element.getAttribute("data-pwa-area")
            this.areas[areaName] = new PWA_Area(areaName, element);
        });
    }

    get theme() {
        return this._theme || "light"
    }

    set theme(value) {
        this._theme = value;

        let schemes = document.querySelector("head > meta[name='color-scheme']");
        if (schemes) {
            schemes.setAttribute("content", value);
            localStorage.setItem("theme", value);
            document.querySelector("html").classList.remove("theme-dark", "theme-light");
            document.querySelector("html").classList.add("theme-" + value);
        }
        else {
            console.warn("Theming depends on meta[name='color-scheme']");
        }

        this.pwa._triggerEvent("pwa.theme", {theme: value});
    }

    addStyleSheet(url) {
        DOM.addStyleSheet(url, {
            "data-pwa": this.pwa.router.current.path
        });

    }

    async showDialog(options) {
        let ctx = await window.xo.form.factory.build();
        let frm = ctx.createForm();
        frm.renderSingleControl({
            ...options || {},
            type: "dialog"
        }).then(r => {
            var f = window.xo.form.factory.getFieldFromElement(r);
            f._control.show();
        });
    }

}

export default PWA_UI;