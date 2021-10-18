class ExoRuleEngineBase {

    constructor(exo) {
        this.exo = exo;
    }

    checkRules(context) {} // for subclassing
}

export default ExoRuleEngineBase;