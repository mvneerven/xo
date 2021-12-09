import ExoFormFactory from '../core/ExoFormFactory';

class ExoFormDefaultValidation {
    constructor(exo) {
        this.exo = exo;
        exo.form.setAttribute('novalidate', true);
    }

    /**
     * Checks form validity
     * @param {Object} settings - By default, inScope: true is added. 
     * Use inScope: false to check for overall validity including pages that are currently out of scope .
     * @returns {Boolean} - true if all form controls are valid.
     */
    checkValidity(settings) {
        settings = {
            inScope: true,
            page: undefined,
            ...settings || {}
        }

        let numInvalid = this.exo.query(f => {
            const control = f._control;

            console.log(ExoFormFactory.fieldToString(f), "visible: ", control.visible , "disabled: ", control.disabled )

            
            
            if(!control.visible || control.disabled){
                
                return false;
            }

            return !control.valid;

        }, settings).length;

        let valid = numInvalid === 0;
        return valid;
    }

    /**
     * Makes the validation addin report any validation errors
     * @param {*} page - optional page to check
     */
    reportValidity(page) {
        let invalidFields = this.exo.query(f => {
            return page === undefined ? !f._control.valid : page === f._page.index && !f._control.valid;
        }).map(f => {
            return {
                field: f,
                validationMessage: f._control.validationMessage
            }
        });

        if (invalidFields.length) {
            let returnValue = this.exo.events.trigger(ExoFormFactory.events.reportValidity, {
                invalid: invalidFields
            });

            if (returnValue !== false) {
                this.focus(invalidFields[0].field);
            }
        }
    }

    /**
     * Focuses the given field, optionally moving to the page the field is displayed on.
     * @param {*} field - field element in the schema
     */
    focus(field) {
        let element = field._control.htmlElement;

        const f = field => {
            let element = field._control.htmlElement;
            field._control.showValidationError();
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
            f(field);
        }
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

    testValidity(e, field) {
        if (this.runValidCheck)
            e.preventDefault();
    }
}

export default ExoFormDefaultValidation;