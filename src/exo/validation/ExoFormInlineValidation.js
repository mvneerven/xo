
import InlineFieldValidator from './InlineFieldValidator';
import ExoFormDefaultValidation from './ExoFormDefaultValidation';
import ExoFormFactory from '../core/ExoFormFactory';

class ExoFormInlineValidation extends ExoFormDefaultValidation {
    constructor(exo) {
        super(exo);
        const form = exo.form;
        exo.on(ExoFormFactory.events.interactive, e => {

            exo.all().forEach(control=>{
                if(control.hasValue){
                    control._validator = new InlineFieldValidator(control);    
                }
            });

            // For some reason without setting the forms novalidate option
            // we are unable to focus on an input inside the form when handling
            // the 'submit' event
            form.setAttribute('novalidate', true);
        });
    }

    reportValidity(page) {
        let all = this.getAllControls({ page: page })

        let invalidFields = all.filter(control => {
            return !control.valid;
        }).map(control => {
            return {
                field: control.context.field,
                validationMessage: control.validationMessage
            }
        });

        if (invalidFields.length) {
            let returnValue = this.exo.events.trigger(ExoFormFactory.events.reportValidity, {
                invalid: invalidFields
            });

            if (returnValue !== false) {
                invalidFields.forEach(control => {
                    if(control.hasValue && control._validator)
                        control._validator.showError();
                })
            }
        }
    }
}

export default ExoFormInlineValidation;