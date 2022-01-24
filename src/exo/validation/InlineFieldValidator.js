class InlineFieldValidator {

    constructor(control, options) {
        options = options || {};
        this._ctl = control;
        this._cnt = this._ctl.container || this._ctl.htmlElement;
        this._error = null;
        this._onInvalid = this._onInvalid.bind(this);
        this._onInput = this._onChange.bind(this);
        this._onChange = this._onChange.bind(this);
        this.bindEventListeners();
    }

    get control(){
        return this._ctl
    }

    bindEventListeners() {
        if (this._cnt) {
            this._cnt.querySelectorAll("[name]").forEach(c => {
                c.addEventListener('invalid', this._onInvalid);
            })

            this._cnt.addEventListener("change", this._onChange);
            this._cnt.addEventListener("input", this._onInput);
        }
    }

    // Displays an error message and adds error styles and aria attributes
    showError() {
        this.control.showHelp(this.control.validationMessage, {
            type: "invalid"
        })
    }

    // Hides an error message if one is being displayed
    // and removes error styles and aria attributes
    hideError() {
        this.control.showHelp("", {
            type: "invalid"
        });
    }

    // Suppress the browsers default error messages
    _onInvalid(event) {
        event.preventDefault();
    }

    _onChange(event) {
        if (!this.control.valid) {
            this.showError();
        }
        else {
            this.hideError();
        }
    }
}

export default InlineFieldValidator;