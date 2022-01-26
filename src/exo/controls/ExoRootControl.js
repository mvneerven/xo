import ExoDivControl from "./base/ExoDivControl";
import DOM from "../../pwa/DOM";
import ExoFormFactory from "../core/ExoFormFactory";

class ExoRootControl extends ExoDivControl {
    _pages = [];
    _controls = [];
    _namedControls = {};

    constructor() {
        super(...arguments);
        this.context.exo.root = this;
        this.htmlElement = document.createElement("form")
        this.htmlElement.data = { xo_form: this.context.exo };

        this.acceptProperties(
            {
                name: "id",
                type: String
            },
            {
                name: "pages",
                type: Array
            },
            {
                name: "controls",
                type: Array
            },

            {
                name: "form",
                type: Object
            },
            {
                name: "model",
                type: Object
            }
        )
    }

    mapAcceptedProperties() {
        super.mapAcceptedProperties();
        this._loadAddins();

        let pageIndex = 0;
        this.pages.forEach(page => {
            pageIndex++;
            page = {
                ...page,
                index: pageIndex,
                isPage: true,
                class: "exf-cnt exf-page" + (page.class ? " " + page.class : ""),
                type: page.type || "fieldset"
            }
            this._children.push(this.createChild(page))
        });

        let navField = {
            type: "formnav",
            controls: this.controls
        }

        this._children.push(this.createChild(navField))
    }

    _addNamedControl(name, control) {
        if (this._namedControls[name]) {
            const err = `A control with the name ${name} already exists`;
            console.error(err);
            throw Error(err);
        }

        this._namedControls[name] = control;
    }

    get pages() {
        return this._pages;
    }

    set pages(data) {
        this._pages = data
    }

    _getControlByName(name) {
        return this._namedControls ? this._namedControls[name] : null
    }

    _loadAddins() {
        const exo = this.context.exo;
        this.addins = {};
        for (var n in ExoFormFactory.meta) {
            let cmp = ExoFormFactory.meta[n];
            let obj = cmp.type.getType(this.context.exo);
            if (!obj || !obj.type)
                throw TypeError("Addin not found: '" + n + "'")

            this.addins[n] = new obj.type(this.context.exo);
            this.addins[n].addinType = obj.name;
        }
    }

    toString() {
        return "root"
    }

    getContainerTemplate(obj) {
        return /*html*/`<div class="exf-container"><span data-replace="true"></span></div>`;
    }

    async render() {
        await super.render();
        this.container.classList.add("exf-container");

        let cls = this.form?.class?.split(' ') || [];
        this.htmlElement.classList.add(...cls);
        this.htmlElement.setAttribute("method", "post");
        this.htmlElement.classList.add("exf-form");

        this.pageContainer = DOM.parseHTML('<div class="exf-wrapper" />');

        for (let child of this.children.filter(c => {
            return c.type !== "formnav"
        })) {

            let span = document.createElement("span");
            this.pageContainer.appendChild(span)
            let elm = await child.render();
            DOM.replace(span, elm);

        };

        this.htmlElement.appendChild(this.pageContainer);

        this.navControl = this.children.find(c => {
            return c.type === "formnav"
        })

        let navContainer = await this.navControl.render();
        this.htmlElement.appendChild(navContainer);

        if (this.id) {
            this.container.setAttribute("id", this.id);
        }

        await this._finalizeForm();
        return this.container
    }

    async _finalizeForm() {
        const me = this;

        this.events = this.context.exo.events;

        await this.addins.navigation.render();

        this.addins.progress.render();

        this.setAddinClasses()
        this.addins.theme.apply();

        this.container.classList.add(this.pages.length > 1 ? "exf-multi-page" : "exf-single-page");

        this.htmlElement.addEventListener("submit", e => {
            e.preventDefault(); // preventing default behaviour
            e.stopPropagation();
            this.context.exo.submitForm(e);
        });

        // stop propagating events to above form 
        // in case for is embedded in another one (such as ExoFormBuilder)
        this.htmlElement.addEventListener("change", e => {
            e.stopPropagation();
        })

        this.addins.rules.checkRules(this.context.exo.context, this.context.exo.options);

        this.addins.navigation.restart();

        this.events.trigger(ExoFormFactory.events.renderReady);

        this.waitForInteractive();
    }

    waitForInteractive() {
        const me = this;

        const triggerInteractive = () => {
            me.events = me.context.exo.events;
            if (!me.events.triggeredInteractive) {
                me.events.trigger(ExoFormFactory.events.interactive);
                me.events.triggeredInteractive = true;
            }
        }

        if (typeof (IntersectionObserver) !== "undefined") {
            // Test for fom becoming user-interactive 
            var observer = new IntersectionObserver((entries, observer) => {
                if (me.container.offsetHeight) {
                    observer = null;
                    triggerInteractive();
                }

            }, { root: document.documentElement });

            observer.observe(me.container);
        }
        else {
            setTimeout(() => {
                triggerInteractive();
            }, 100);
        }

    }

    setAddinClasses() {
        Object.entries(this.addins).forEach(entry => {
            this.container.classList.add(`exf-${entry[0]}-${entry[1].addinType}`);
        })
    }


}

export default ExoRootControl;