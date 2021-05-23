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

export default InlineFieldValidator;