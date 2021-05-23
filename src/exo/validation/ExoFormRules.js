import DOM from '../../pwa/DOM';
import Core from '../../pwa/Core';
import ExoFormFactory from '../core//ExoFormFactory';

class ExoRuleEngineBase {

    constructor(exo) {
        this.exo = exo;
    }

    checkRules() {} // for subclassing
}

class ExoRuleEngine extends ExoRuleEngineBase {

    ruleMethods = {
        visible: [Field.show, Field.hide],
        enabled: [Field.enable, Field.disable],
        scope: [Page.scope, Page.descope],
        customMethod: [Field.callCustomMethod, () => { }],
        goto: [Page.goto, () => { }],
        dialog: [Dialog.show, () => { }]
    }
    
    // Interpret rules like "msg_about,change,value,!,''"
    interpretRule(objType, f, rule) {
        const _ = this;

        let obj = ExoFormFactory.fieldToString(f)

        console.debug("Rules: running rule on " + obj + " -> [", rule.expression.join(', ') + "]");


        if (rule.expression.length === 5) {

            let method = _.ruleMethods[rule.type];
            if (method) {
                let dependencyField = _.getRenderedControl(rule.expression[0]);

                if (dependencyField) {
                    let dependencyControl = dependencyField.querySelector("[name]");
                    if (!dependencyControl) dependencyControl = dependencyField;
                    if (!dependencyControl) {
                        console.error("Rules: dependency control for rule on '" + obj + "' not found");
                    }
                    else {
                        console.debug("Rules: dependency control for rule on '" + obj + "': ", dependencyControl.name);

                        const func = (e) => {
                            console.debug("Event '" + rule.expression[1] + "' fired on ", DOM.elementPath(e));

                            let ruleArgs = rule.expression.slice(2, 5);
                            let expressionMatched = _.testRule(f, dependencyControl, ...ruleArgs);
                            console.debug("Rules: rule", ruleArgs, "matched: ", expressionMatched);

                            let index = expressionMatched ? 0 : 1;

                            const rf = method[index];
                            console.debug("Rules: applying rule", rule.expression[1], obj);
                            rf.apply(f._control.htmlElement, [{
                                event: e,
                                field: f,
                                exoForm: _.exo,
                                rule: rule,
                                dependency: dependencyControl
                            }])

                            let host = _.getEventHost(dependencyControl);

                            _.setupEventEventListener({
                                field: f,
                                host: host,
                                rule: rule,
                                eventType: rule.expression[1],
                                method: func
                            })
                        }
                        func({ target: dependencyControl });
                    };
                }
                else {
                    console.warn("Dependency field for", f, "not found with id '" + rule.expression[0] + "'");
                }
            }
            else {
                console.error("Rule method for rule type", rule.type, "on field", f);
            }
        }
    }

    setupEventEventListener(settings) {
        if (settings.eventType === "livechange") {
            settings.eventType = "input";
        }

        console.debug("Setting up event listener of type '" + settings.eventType + "' on ", DOM.elementToString(settings.host));
        settings.host.addEventListener(settings.eventType, settings.method);
    }

    getRenderedControl(id) {
        return this.exo.form.querySelector('[data-id="' + id + '"]')
    }

    checkRules() {
        const _ = this;
        _.exo.schema.pages.forEach(p => {
            if (Array.isArray(p.rules)) {
                console.debug("Checking page rules", p);
                p.rules.forEach(r => {
                    if (Array.isArray(r.expression)) {
                        _.interpretRule("page", p, r);
                    }
                })
            }

            p.fields.forEach(f => {
                if (Array.isArray(f.rules)) {
                    console.debug("Checking field rules", f);
                    f.rules.forEach(r => {
                        if (Array.isArray(r.expression)) {
                            _.interpretRule("field", f, r);
                        }
                    })
                }
            });
        });
    }

    testRule(f, control, value, compare, rawValue) {
        var t = undefined;
        
        let v = this.exo.getFieldValue(control);
        try {
            t = Core.scopeEval(this, "return " + rawValue);
        }
        catch (ex) {
            console.error("Error evaluating rule control value for ", control, compare, v, rawValue, ex);
            throw "Error evaluating " + rawValue;
        }
        console.debug("Value of '" + control.name + "' =", v);
        return Core.compare(compare, v, t)
    }
    getEventHost(ctl) {
        let eh = ctl.closest('[data-evtarget="true"]');
        return eh || ctl;
    }
}

class ExoFormRules {

    static types = {
        auto: undefined,
        none: ExoRuleEngineBase,
        default: ExoRuleEngine
    }

    static getType(exo) {
        let type = exo.schema.rules;
        if (typeof (type) === "undefined" || type === "auto")
            type = ExoFormRules.matchRuleEngineType(exo);

        return ExoFormRules.types[type];
    }

    static matchRuleEngineType(exo) {
        return "default"
    }
}

class Field {
    static show(obj) {
        DOM.show(obj.field._control.container);
    }
    static hide(obj) {
        DOM.hide(obj.field._control.container);
    }
    static enable(obj) {
        DOM.enable(obj.field._control.htmlElement);
    }
    static disable(obj) {
        DOM.disable(obj.field._control.htmlElement);
    }
    static callCustomMethod(obj) {
        if (!obj || !obj.exoForm)
            throw "Invalid invocation of callCustomMethod";

        let method = obj.rule.method;
        if (method) {
            let f = obj.exoForm.options.customMethods[method];
            f.apply(obj.exoForm, [obj])
        }
    }
}

class Page {
    static scope(obj) {
        obj.field._control.container.removeAttribute("data-skip");
    }
    static descope(obj) {
        obj.field._control.container.setAttribute("data-skip", "true");
    }

    static goto(obj) {
        return obj.exoForm.addins.navigation.goto(obj.rule.page);
    }
}

//TODO
class Dialog {
    static show(obj) {
        //TODO
    }
}

export default ExoFormRules;