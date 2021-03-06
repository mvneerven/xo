import ExoFormDefaultValidation from './ExoFormDefaultValidation';
import ExoFormInlineValidation from  './ExoFormInlineValidation';

class ExoFormValidation {
    static types = {
        auto: undefined,
        html5: ExoFormDefaultValidation,
        inline: ExoFormInlineValidation
    }

    static getType(exo) {
        let type = exo.schema.validation  || exo.context?.config?.defaults?.validation;
        if (type === "auto" || typeof (type) === "undefined")
            type = ExoFormValidation.matchValidationType(exo);

        let tp = ExoFormValidation.types[type];
        return {
            name: type,
            type: tp || ExoFormDefaultValidation
        }
    }

    static matchValidationType(exo) {
        return "inline";
    }
}

export default ExoFormValidation;
