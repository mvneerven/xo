import ExoFormFactory from '../ExoFormFactory';

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
            return !f._control.valid;

        }, settings).length;

        let valid = numInvalid === 0;

        console.debug(this.constructor.name, "checkValidity", "Settings:", settings, "Valid=", valid);

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
                console.log(invalidFields);
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

class InlineFieldValidator {

    constructor(field) {

        this._field = field;
        this._cnt = this._field._control.container || this._field._control.htmlElement;

        this._error = null;


        this._onInvalid = this._onInvalid.bind(this);
        //this._onInput = this._onInput.bind(this);
        this._onChange = this._onChange.bind(this);

        this.bindEventListeners();
    }


    bindEventListeners() {
        if (this._cnt) {
            this._cnt.querySelectorAll("[name]").forEach(c => {
                c.addEventListener('invalid', this._onInvalid);
            })

            this._cnt.addEventListener("change", this._onChange);
        }
    }

    // Displays an error message and adds error styles and aria attributes
    showError() {
        this._field._control.showHelp(this._field._control.validationMessage, {
            type: "invalid"
        })
    }

    // Hides an error message if one is being displayed
    // and removes error styles and aria attributes
    hideError() {
        this._field._control.showHelp();
    }

    // Suppress the browsers default error messages
    _onInvalid(event) {
        event.preventDefault();
    }

    _onChange(event) {

        if (!this._field._control.valid) {
            this.showError();
        }
        else {
            this.hideError();
        }
    }
}

class ExoFormInlineValidation extends ExoFormDefaultValidation {
    constructor(exo) {
        super(exo);
        const form = exo.form;
        exo.on(ExoFormFactory.events.interactive, e => {

            exo.query().forEach(f => {
                f._control._validator = new InlineFieldValidator(f);
            })

            // For some reason without setting the forms novalidate option
            // we are unable to focus on an input inside the form when handling
            // the 'submit' event
            form.setAttribute('novalidate', true);
        });
    }

    reportValidity(page) {
        const cb = page ? f => {
            return f._page.index === page && !f._control.valid; // only controls on given page
        } : f => {
            return !f._control.valid; // across all pages
        }
        let invalidFields = this.exo.query(cb);
        invalidFields.forEach(f => {
            f._control._validator.showError();
        })
    }
}

class ExoFormValidation {
    static types = {
        auto: undefined,
        html5: ExoFormDefaultValidation,
        inline: ExoFormInlineValidation
    }

    static getType(exo) {
        let type = exo.schema.validation;
        if (type === "auto" || typeof (type) === "undefined")
            type = ExoFormValidation.matchValidationType(exo);

        let tp = ExoFormValidation.types[type];
        return tp || ExoFormDefaultValidation;
    }

    static matchValidationType(exo) {
        return "inline";
    }
}

export default ExoFormValidation;
