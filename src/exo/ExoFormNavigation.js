
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

    canMove(fromPage, toPage){ // to be subclassed
        console.debug("Check navigation from", fromPage , "to", toPage);
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

        const tpl = /*html*/`<button name="{{name}}" type="{{type}}" class="btn {{class}}">{{caption}}</button>`;

        let btn = DOM.parseHTML(DOM.format(tpl, options));
        this.buttons[name].element = btn;

        this.container.appendChild(btn);
    }
    

    update() { }
}

class ExoFormNoNavigation extends ExoFormNavigationBase {

    next() {
        this.exo.updateView(+1);
    }

    back() {
        this.exo.updateView(-1);
    }

    restart() {
        this.exo.updateView(0, 1);
    }

}

class ExoFormDefaultNavigation extends ExoFormNoNavigation {

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
        })
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
                    _.exo.updateView(-1);
                    e.preventDefault();
                    e.returnValue = false;
                }
            }
            else if (e.keyCode === 13) { // enter
                if (e.target.type !== "textarea") {
                    //var isValid = _.exo.form.reportValidity ? _.exo.form.reportValidity() : true;
                    //if (isValid) {
                    let exf = e.target.closest("[data-exf]");
                    let field = ExoFormFactory.getFieldFromElement(exf)
                    //if (exf && exf.data && exf.data.field) {
                    _.checkForward(field, "enter", e);
                    e.preventDefault();
                    e.returnValue = false;
                    //}
                    //}
                }
            }
        });

        _.exo.on(ExoFormFactory.events.page, e => {
            _.exo.focusFirstControl();
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
                    _.updateView(+1);
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

class WizardProgress {
    container = null;

    templates = {
        progressbar: /*html*/`
            <nav class="exf-wiz-step-cnt">
                <div class="step-wizard" role="navigation">
                <div class="progress">
                    <div class="progressbar empty"></div>
                    <div class="progressbar prog-pct"></div>
                </div>
                <ul>
                    {{inner}}
                </ul>
                </div>
                
            </nav>`,
        progressstep: /*html*/`
            <li class="">
                <button type="button" id="step{{step}}">
                    <div class="step">{{step}}</div>
                    <div class="title">{{pagetitle}}</div>
                </button>
            </li>`
    }

    constructor(generator) {
        this.generator = generator;
    }

    render() {
        const _ = this;

        _.container = DOM.parseHTML(_.templates.progressbar.replace("{{inner}}", ""));
        _.ul = _.container.querySelector("ul");

        let nr = 0;
        _.generator.formSchema.pages.forEach(p => {
            nr++;
            _.ul.appendChild(DOM.parseHTML(DOM.format(this.templates.progressstep, {
                step: nr,
                pagetitle: p.legend
            })));
        });

        _.container.querySelectorAll(".step-wizard ul button").forEach(b => {
            b.addEventListener("click", e => {
                var step = parseInt(b.querySelector("div.step").innerText);
                _.generator.updateView(0, step);
            })
        });

        return this.container;
    }

    setClasses() {
        const _ = this;

        let index = _.generator.currentPage;
        let steps = _.generator.getLastPage();

        if (!_.container)
            return;

        if (index < 0 || index > steps) return;

        var p = (index - 1) * (100 / steps);

        let pgb = _.container.querySelector(".progressbar.prog-pct");
        if (pgb)
            pgb.style.width = p + "%";

        var ix = 0;
        _.container.querySelectorAll("ul li").forEach(li => {
            ix++;
            li.classList[ix === index ? "add" : "remove"]("active");

            li.classList[_.generator.isPageValid(ix) ? "add" : "remove"]("done");

        });

        _.container.querySelectorAll(".exf-wiz-step-cnt .step-wizard li").forEach(li => {
            li.style.width = (100 / (steps + 1)) + "%";
        })

    }
}

class ExoFormNavigation{
    static types = {
        auto: undefined,
        none: ExoFormNoNavigation,
        default: ExoFormDefaultNavigation,
        wizard: ExoFormWizardNavigation,
        survey: ExoFormSurveyNavigation
    }

    static getType(exo){
        let type = exo.formSchema.navigation;
        if(type === "auto")
            type = ExoFormNavigation.matchNavigationType(exo);
        
        return ExoFormNavigation.types[type];
    }

    static matchNavigationType(exo){
        if(exo.formSchema.pages.length > 1)
            return "wizard"

        return "default"
    }
}

export default ExoFormNavigation;