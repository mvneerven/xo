import DOM from '../pwa/DOM';
import ExoFormFactory from './ExoFormFactory';

class ExoFormNavigationBase {

    buttons = {};

    constructor(exo) {
        this.exo = exo;
        this._visible = true;
        this._currentPage = 1;
        this.form = exo.form;
        
    }

    get visible() {
        return this._visible;
    }

    set visible(value) {
        this._visible = value;
        let cnt = this.form.querySelector(".exf-nav-cnt");
        if (cnt) DOM[this._visible ? "show" : "hide"]();
    }

    clear() {
        let cnt = this.form.querySelector(".exf-nav-cnt");
        if (cnt) cnt.remove();
    }

    render() {
        const tpl = /*html*/`<fieldset class="exf-cnt exf-nav-cnt"></fieldset>`;
       

        this.container = DOM.parseHTML(tpl);
        
        for (var b in this.buttons) {
            this.addButton(b, this.buttons[b])
        }
 
        this.form.appendChild(this.container);

        this.form.setAttribute("data-current-page", this.currentPage);

        this.form.querySelector(".exf-cnt.exf-nav-cnt").addEventListener("click", e => {

            console.log("nav click: " + e.target.name);

            switch (e.target.name) {
                case "next":
                    e.preventDefault();
                    this.next();
                    break;
                case "prev":
                    e.preventDefault();
                    this.back();
                    break;
            }

        })

        this.exo.on(ExoFormFactory.events.page, e => {
            this.updateButtonStates()
        });

        this.exo.on(ExoFormFactory.events.pageRelevancyChange, e => {
            this._pageCount = this.getLastPage();
            this.updateButtonStates()
        })

        this.exo.on(ExoFormFactory.events.interactive, this._ready.bind(this));
    }

    _ready(e){
        this._pageCount = this.getLastPage();
        
        this.updateButtonStates()
    }

    canMove(fromPage, toPage) { // to be subclassed
        console.debug("Check navigation from", fromPage, "to", toPage);
        return true;
    }

    addButton(name, options) {
        options = {
            class: "",
            type: "button",
            caption: name,
            name: name,
            ...options || {}
        }

        
        let btn = DOM.parseHTML(/*html*/`<button name="${options.name}" type="${options.type}" class="exf-btn ${options.class}">${options.caption}</button>`);

        this.buttons[name].element = btn;

        this.container.appendChild(btn);
    }

    _updateView(add, page) {

        let current = this.currentPage;

        if (add > 0 && current > 0) {

            if (!this.exo.addins.validation.isPageValid(this.currentPage)) {
                this.exo.addins.validation.reportValidity(this.currentPage);
                return;
            }
        }

        if (add !== 0)
            page = parseInt("0" + this.form.getAttribute("data-current-page")) || 1;

        console.log("updateview 1 -> ", add, page, "current", current)

        page = this._getNextPage(add, page)

        console.log("updateview 2 -> ", add, page, "current", current)
        this._pageCount = this.getLastPage();

        this._currentPage = page;

        if (current > 0) {
            if (!this.canMove(current, page))
                return;

            let returnValue = this.exo.triggerEvent(ExoFormFactory.events.beforePage, {
                from: current,
                page: page,
                pageCount: this.pageCount
            });

            if (returnValue === false)
                return;
        }

        this.form.setAttribute("data-current-page", this.currentPage);
        this.form.setAttribute("data-page-count", this.exo.schema.pages.length);
        this._currentPage = page;

        let i = 0;


        this.form.querySelectorAll('.exf-page[data-page]').forEach(p => {
            i++;
            p.classList[i === page ? "add" : "remove"]("active");
        });

        this.update();

        this.exo.triggerEvent(ExoFormFactory.events.page, {
            from: current,
            page: page,
            pageCount: this.pageCount
        });

        return page;
    }

    /**
     * Moves to the next page in a multi-page form.
     */
    next() {
        this._updateView(+1);
    }

    /**
     * Moves to the previous page in a multi-page form.
     */
    back() {
        this._updateView(-1);
    }

    /**
     * Moves to the first page in a multi-page form.
     */
    restart() {
        this.goto(1);
    }

    /**
     * Moves to the given page in a multi-page form.
     */
    goto(page) {
        return this._updateView(0, page);
    }


    get currentPage() {
        if (!this._currentPage) this._currentPage = 1;
        return this._currentPage;
    }

    get pageCount() {
        if (!this._pageCount) this._pageCount = this.getLastPage();

        return this._pageCount;
    }

    _getNextPage(add, page) {
        let ok = false;

        var skip;
        do {

            page += add;

            if (page > this.exo.schema.pages.length) {
                return undefined;
            };

            let pgElm = this.form.querySelector('.exf-page[data-page="' + page + '"]');
            if (pgElm) {
                skip = pgElm.getAttribute("data-skip") === "true";

                console.debug("Wizard Page " + page + " currently " + (skip ? "OUT OF" : "in") + " scope");
                if (!skip) {
                    ok = true;
                }
            }
            else {
                ok = true;
                return undefined;
            }

            if (add === 0)
                break;

        } while (!ok)

        if (page < 1) page = 1;

        return page;
    }

    getLastPage() {

        let pageNr = parseInt("0" + this.form.getAttribute("data-current-page")) || 1
        let lastPage = 0;
        let nextPage = -1;
        do {
            nextPage = this._getNextPage(+1, pageNr);
            if (nextPage) {
                lastPage = nextPage;
                pageNr = nextPage;
            }

        } while (nextPage)

        return lastPage || pageNr || 1;
    }

    updateButtonStates() {

        let prev = this.buttons["prev"];
        if (prev && prev.element)
            DOM[this.currentPage === 1 ? "disable" : "enable"](prev.element);

        let nxt = this.buttons["next"];
        if (nxt && nxt.element)
            DOM[this.currentPage === this.pageCount ? "disable" : "enable"](nxt.element);
    }

    update() { }
}

class ExoFormNoNavigation extends ExoFormNavigationBase {
}

class ExoFormStaticNavigation extends ExoFormNavigationBase {
    render() {
        super.render();

        this.exo.on(ExoFormFactory.events.renderReady, e => {

            //TODO fix this 
            setTimeout(() => {
                this.form.querySelectorAll(".exf-page").forEach(elm => {
                    elm.style.display = "block";
                });
            }, 1);

        })

    }
}

class ExoFormDefaultNavigation extends ExoFormNavigationBase {

    buttons = {
        "send": {
            caption: "Submit",
            class: "form-post"
        }
    }

    render() {
        super.render();

        this.buttons["send"].element.addEventListener("click", e => {
            e.preventDefault();
            this.exo.submitForm();
        })
    }
}

class ExoFormWizardNavigation extends ExoFormDefaultNavigation {
    buttons = {
        prev: {
            "caption": "Back",
            "class": "form-prev"
        },
        next: {
            "caption": "Next ↵",
            "class": "form-next"
        },
        send: {
            caption: "Submit",
            class: "form-post"
        }
    };

    
}

class ExoFormSurveyNavigation extends ExoFormWizardNavigation {

    multiValueFieldTypes = ["checkboxlist", "tags"]; // TODO better solution

    render() {
        const _ = this;
        super.render();

        const check = e => {
            let exf = e.target.closest("[data-exf]");
            if (exf && exf.data && exf.data.field) {
                _.checkForward(exf.data.field, "change", e)
            }
        };

        _.exo.form.querySelector(".exf-wrapper").addEventListener("change", check);

        _.exo.form.addEventListener("keydown", e => {
            if (e.keyCode === 8) { // backspace - TODO: Fix 
                if ((e.target.value === "" && (!e.target.selectionStart) || e.target.selectionStart === 0)) {
                    _.this.back();
                    e.preventDefault();
                    e.returnValue = false;
                }
            }
            else if (e.keyCode === 13) { // enter
                if (e.target.type !== "textarea") {
                    let exf = e.target.closest("[data-exf]");
                    let field = ExoFormFactory.getFieldFromElement(exf)
                    _.checkForward(field, "enter", e);
                    e.preventDefault();
                    e.returnValue = false;
                }
            }
        });

        _.exo.on(ExoFormFactory.events.page, e => {
            _.focusFirstControl();
        })

        let container = _.exo.form.closest(".exf-container");

        container.classList.add("exf-survey");

        _.exo.on(ExoFormFactory.events.interactive, e => {
            _.exo.form.style.height = container.offsetHeight + "px";
            _.exo.form.querySelectorAll(".exf-page").forEach(p => {
                p.style.height = container.offsetHeight + "px";
            })
        })
    }

    focusFirstControl() {

        var first = this.exo.form.querySelector(".exf-page.active .exf-ctl-cnt");

        if (first && first.offsetParent !== null) {
            first.closest(".exf-page").scrollIntoView();
            setTimeout(e => {
                let ctl = first.querySelector("[name]");
                if (ctl && ctl.offsetParent) ctl.focus();
            }, 20);
        }
    }

    checkForward(f, eventName, e) {
        if (!this.exo.container) {
            return;
        }

        this.exo.container.classList.remove("end-reached");
        this.exo.container.classList.remove("step-ready");

        //var isValid = f._control.htmlElement.reportValidity ? f._control.htmlElement.reportValidity() : true;
        var isValid = f._control.valid;
        if (isValid || !this.multiValueFieldTypes.includes(f.type)) {
            if (this._currentPage == this.getLastPage()) {
                this.exo.container.classList.add("end-reached");
                this.form.appendChild(
                    this.exo.container.querySelector(".exf-nav-cnt")
                );
            }
            else {
                // special case: detail.field included - workaround 
                let type = f.type;
                if (e.detail && e.detail.field)
                    type = e.detail.field;

                if (!["checkboxlist", "tags"].includes(type)) { // need metadata from controls
                    this.exo.addins.navigation.next();
                }

                else {
                    this.exo.container.classList.add("step-ready");
                }

                f._control.container.appendChild(
                    this.exo.container.querySelector(".exf-nav-cnt")
                );
            }
        }
    }
}

class ExoFormNavigation {
    static types = {
        auto: undefined,
        none: ExoFormNoNavigation,
        static: ExoFormStaticNavigation,
        default: ExoFormDefaultNavigation,
        wizard: ExoFormWizardNavigation,
        survey: ExoFormSurveyNavigation
    }

    static getType(exo) {
        let type = exo.schema.navigation;
        if (typeof (type) === "undefined" || type === "auto")
            type = ExoFormNavigation.matchNavigationType(exo);

        return ExoFormNavigation.types[type];
    }

    static matchNavigationType(exo) {
        if (exo.schema.pages.length > 1)
            return "wizard"

        return "default"
    }
}

export default ExoFormNavigation;