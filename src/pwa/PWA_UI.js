
import PWA_Notifications from './PWA_Notifications';
import PWA_Area from './PWA_Area';
import DOM from '../pwa/DOM';
import PWA_RouterMenu from './PWA_RouterMenu';

class PWA_UI {
    _dirtyMessage = 'If you continue your changes will not be saved.';
    _dirty = false;

    areas = {};

    notifications = new PWA_Notifications(this);

    static Menu = PWA_RouterMenu;

    constructor(pwa) {
        const _ = this;
        this.pwa = pwa;

        this.html = document.querySelector("html");

        if (this.pwa.id) {
            this.html.setAttribute("id", this.pwa.id);
        }

        let prefDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)").matches : false;
        this.pwa.config.UI.user = {
            prefersDarkScheme: prefDark,
            currentTheme: localStorage.getItem("theme") || (prefDark ? "dark" : "light")
        }

        if (!this.pwa.config.UI.allowUserSelection) {
            this.html.classList.add("no-user-select");
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

    createMenu() {
        return new PWA_UI.Menu(this.pwa.router);
    }

    _setAreas() {
        let ar = document.querySelectorAll("[data-pwa-area]");

        if (!ar.length)
            throw TypeError("No PWA areas defined");

        ar.forEach(element => {
            var areaName = element.getAttribute("data-pwa-area")
            this.areas[areaName] = new PWA_Area(areaName, element);
        });
    }

    // clear areas with data-reset="route" attrib
    clearAffectedAreas() {
        for (var a in this.areas) {
            let area = this.areas[a];
            if (area.autoReset) {
                area.clear();
            }
        }
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

        this.pwa.events.trigger("pwa.theme", { theme: value });
    }

    addStyleSheet(url) {
        DOM.addStyleSheet(url, {
            "data-pwa": this.pwa.router.current.path
        });

    }

    async showDialog(options) {
        return DOM.showDialog(options);
    }

}

export default PWA_UI;