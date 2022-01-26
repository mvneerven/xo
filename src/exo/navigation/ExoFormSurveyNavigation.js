import ExoFormWizardNavigation from './ExoFormWizardNavigation';
import ExoFormFactory from '../core/ExoFormFactory';

class ExoFormSurveyNavigation extends ExoFormWizardNavigation {

    multiValueFieldTypes = ["checkboxlist", "tags"]; // TODO better solution

    async render() {
        const check = e => {
            let ctl = xo.control.get(e.target);
            if (ctl) {
                this.checkForward(ctl, "change", e)
            }
        };

        this.exo.form.querySelector(".exf-wrapper").addEventListener("change", check);

        this.exo.form.addEventListener("keydown", e => {
            if (e.keyCode === 8) { // backspace - TODO: Fix 
                if ((e.target.value === "" && (!e.target.selectionStart) || e.target.selectionStart === 0)) {
                    this.this.back();
                    e.preventDefault();
                    e.returnValue = false;
                }
            }
            else if (e.keyCode === 13) { // enter
                if (e.target.type !== "textarea") {
                    let exf = e.target.closest(".exf-cnt");
                    let ctl = xo.control.get(exf)
                    this.checkForward(ctl, "enter", e);
                    e.preventDefault();
                    e.returnValue = false;
                }
            }
        });

        this.exo.on(ExoFormFactory.events.page, e => {
            this.focusFirstControl();
        })

        let container = this.exo.form.closest(".exf-container");

        container.classList.add("exf-survey");

        this.exo.on(ExoFormFactory.events.interactive, e => {
            this.exo.form.style.height = container.offsetHeight + "px";
            this.exo.form.querySelectorAll(".exf-page").forEach(p => {
                p.style.height = container.offsetHeight + "px";
            })
        })

        return super.render();
    }

    focusFirstControl() {

        var first = this.exo.form.querySelector(".exf-page.active .exf-ctl-cnt");

        if (first?.offsetParent !== null) {
            first.closest(".exf-page").scrollIntoView();
            setTimeout(e => {
                let ctl = first.querySelector("[name]");
                if (ctl && ctl.offsetParent) ctl.focus();
            }, 20);
        }
    }

    checkForward(control, eventName, e) {
        if (!this.exo.container) {
            return;
        }

        this.exo.container.classList.remove("end-reached");
        this.exo.container.classList.remove("step-ready");

        
        var isValid = control.valid;
        
        if (isValid || !this.multiValueFieldTypes.includes(control.type)) {
            if (this._currentPage == this.getLastPage()) {
                this.exo.container.classList.add("end-reached");
                this.form.appendChild(
                    this.exo.container.querySelector(".exf-nav-cnt")
                );
            }
            else {
                // special case: detail.field included - workaround 
                let type = control.type;
                if (e.detail?.field)
                    type = e.detail.field;

                if (!["checkboxlist", "tags"].includes(type)) { // need metadata from controls
                    this.exo.addins.navigation.next();
                }

                else {
                    this.exo.container.classList.add("step-ready");
                }

                try{
                 control.container?.appendChild(
                     this.exo.container.querySelector(".exf-nav-cnt")
                 );
                }
                catch{}
            }
        }
    }
}

export default ExoFormSurveyNavigation;