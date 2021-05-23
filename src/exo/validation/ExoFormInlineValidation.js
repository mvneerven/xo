
import InlineFieldValidator from './InlineFieldValidator';
import ExoFormDefaultValidation from './ExoFormDefaultValidation';
import ExoFormFactory from '../core/ExoFormFactory';

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

export default ExoFormInlineValidation;