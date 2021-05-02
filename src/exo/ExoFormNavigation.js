import DOM from '../pwa/DOM';
import ExoFormFactory from './ExoFormFactory';

class ExoFormNavigationBase {

    buttons = {};

    constructor(exo) {
        this.exo = exo;
        this._visible = true;
    }

    get visible() {
        return this._visible;
    }

    set visible(value) {
        this._visible = value;
        let cnt = this.exo.form.querySelector(".exf-nav-cnt");
        if (cnt) DOM[this._visible ? "show" : "hide"]();
    }

    clear() {
        let cnt = this.exo.form.querySelector(".exf-nav-cnt");
        if (cnt) cnt.remove();
    }

    render() {
        const tpl = /*html*/`<fieldset class="exf-cnt exf-nav-cnt"></fieldset>`;
        this.container = DOM.parseHTML(tpl);

        for (var b in this.buttons) {
            this.addButton(b, this.buttons[b])
        }

        this.exo.form.appendChild(this.container);
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

        const tpl = /*html*/`<button name="{{name}}" type="{{type}}" class="exf-btn {{class}}">{{caption}}</button>`;

        let btn = DOM.parseHTML(DOM.format(tpl, options));
        this.buttons[name].element = btn;

        this.container.appendChild(btn);
    }

    next() {
        this.exo.nextPage();
    }

    back() {
        this.exo.previousPage();
    }

    restart() {
        this.exo.gotoPage(1);
    }

    update() { }
}

class ExoFormNoNavigation extends ExoFormNavigationBase {

}

class ExoFormStaticNavigation extends ExoFormNavigationBase {
    render() {
        this.exo.on(ExoFormFactory.events.renderReady, e => {
            this.exo.form.querySelectorAll(".exf-page").forEach(elm => {
                elm.style.display = "block";
            });
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
        const _ = this;
        super.render();

        this.buttons["send"].element.addEventListener("click", e => {
            e.preventDefault();
            _.exo.submitForm();
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

    render() {
        const _ = this;
        super.render();

        this.buttons["prev"].element.addEventListener("click", e => {
            e.preventDefault();
            _.back()
        })

        this.buttons["next"].element.addEventListener("click", e => {
            e.preventDefault();
            _.next()
        })

        _.exo.on(ExoFormFactory.events.page, e => {
            let page = e.detail.page;
            let pageCount = e.detail.pageCount;

            DOM[page === 1 ? "disable" : "enable"](_.buttons["prev"].element);
            DOM[page === pageCount ? "disable" : "enable"](_.buttons["next"].element);
        });


        // let steps = new WizardProgress(_.exo).render();

        // _.exo.container.insertBefore(steps, _.exo.form);


    }


}

class ExoFormSurveyNavigation extends ExoFormWizardNavigation {

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
                    _.exo.previousPage();
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
        const _ = this;
        var first = _.exo.form.querySelector(".exf-page.active .exf-ctl-cnt");

        if (first && first.offsetParent !== null) {
            first.closest(".exf-page").scrollIntoView();
            setTimeout(e => {
                let ctl = first.querySelector("[name]");
                if (ctl && ctl.offsetParent) ctl.focus();
            }, 20);
        }
    }

    checkForward(f, eventName, e) {
        const _ = this.exo;

        if (!_.container) {
            return;
        }

        _.container.classList.remove("end-reached");
        _.container.classList.remove("step-ready");



        //var isValid = f._control.htmlElement.reportValidity ? f._control.htmlElement.reportValidity() : true;
        var isValid = f._control.valid;
        if (isValid || !_.formSchema.multiValueFieldTypes.includes(f.type)) {
            if (_.currentPage == _.getLastPage()) {

                _.container.classList.add("end-reached");

                _.form.appendChild(
                    _.container.querySelector(".exf-nav-cnt")
                );
            }
            else {

                // special case: detail.field included - workaround 
                let type = f.type;
                if (e.detail && e.detail.field)
                    type = e.detail.field;

                if (!["checkboxlist", "tags"].includes(type)) { // need metadata from controls
                    _.nextPage();
                }

                else {
                    _.container.classList.add("step-ready");
                }

                f._control.container.appendChild(
                    _.container.querySelector(".exf-nav-cnt")
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
        let type = exo.formSchema.navigation;
        if (typeof(type) === "undefined" ||  type === "auto" )
            type = ExoFormNavigation.matchNavigationType(exo);

        return ExoFormNavigation.types[type];
    }

    static matchNavigationType(exo) {
        if (exo.formSchema.pages.length > 1)
            return "wizard"

        return "default"
    }
}

export default ExoFormNavigation;