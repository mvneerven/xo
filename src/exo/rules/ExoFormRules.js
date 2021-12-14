import ExoRuleEngineBase from './ExoRuleEngineBase';
import XOFormDataRulesEngine from './XOFormDataRulesEngine';

class ExoFormRules {

    static types = {
        auto: undefined,
        none: ExoRuleEngineBase,
        data: XOFormDataRulesEngine,
        default: XOFormDataRulesEngine
    }

    static getType(exo) {
        let type = exo.schema.rules || exo.context?.config?.defaults?.rules;
        if (typeof (type) === "undefined" || type === "auto")
            type = ExoFormRules.matchRuleEngineType(exo);

        return {
            name: type,
            type: ExoFormRules.types[type]
        }
    }

    static matchRuleEngineType(exo) {
        if (exo.schema.rules === "data")
            return "data";

        return "default"
    }
}

export default ExoFormRules;