import ExoFormFactory from '../core/ExoFormFactory';

class ExoFormDefaultValidation {
    constructor(exo) {
        this.exo = exo;

    }

    /**
     * Checks form validity
     * @param {Object} settings - By default, inScope: true is added. 
     * Use inScope: false to check for overall validity including pages that are currently out of scope .
     * @returns {Boolean} - true if all form controls are valid.
     */
    checkValidity(settings = {}) {

        const invalid = this.getInvalidControls(settings)

        return invalid.length === 0;
    }

    getInvalidControls(settings) {
        settings = {
            inScope: true,
            page: undefined,
            ...settings
        }

        let all = this.getAllControls(settings)

        let invalid = all.filter(control => {
            if (!control.hasValue || !control.visible || control.disabled)
                return false;

            return !control.valid;
        });
        return invalid;
    }

    getAllControls(settings = {}) {
        return settings.page !== undefined
            ? this.exo.root.children[settings.page - 1].all()
            : this.exo.root.all();
    }

    /**
     * Checks whether the given page is valid.
     * @param {*} index - page index (1-based)
     * @returns {Boolean} - true if page is valid.
     */
    isPageValid(index) {
        return this.checkValidity({
            page: index
        })
    }

    /**
     * Makes the validation addin report any validation errors
     * @param {*} page - optional page to check
     */
    reportValidity(page) {

        let controls = this.getInvalidControls({
            page: page
        })

        controls = controls.map(control => {
            return {
                field: control.context.field,
                validationMessage: control.validationMessage
            }
        });

        if (controls.length) {
            let returnValue = this.exo.events.trigger(ExoFormFactory.events.reportValidity, {
                invalid: controls
            });

            if (returnValue !== false)
                this.focus(controls[0]);
        }
    }

    /**
     * Focuses the given field, optionally moving to the page the field is displayed on.
     * @param {*} field - field element in the schema
     */
    focus(ctl) {
        let element = ctl.htmlElement;

        const f = ctl => {
            let element = ctl.htmlElement;
            ctl.showValidationError();
            if (!element.form)
                element = element.querySelector("[name]");
        };

        if (element.offsetParent === null) { // currently invisible
            let pgElm = element.closest('[data-page]');
            if (pgElm) {
                let page = parseInt(pgElm.getAttribute("data-page"));
                this.exo.addins.navigation.goto(page);
                setTimeout(() => {
                    f(field)
                }, 20);
            }
        }
        else {
            f(ctl);
        }
    }



    testValidity(e, field) {
        if (this.runValidCheck)
            e.preventDefault();
    }
}

export default ExoFormDefaultValidation;