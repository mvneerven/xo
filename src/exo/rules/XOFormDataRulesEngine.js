import ExoRuleEngineBase from './ExoRuleEngineBase';
import ExoFormFactory from '../core/ExoFormFactory';
import xo from '../../../js/xo';

class Rule {
    constructor(o) {
        this.field = o.field;
        this.scope = o.scope || o.field.bind;
        this.rule = o.rule;
    }

    toString() {
        return `Rule: ${JSON.stringify(this.rule?.condition || this.rule).substr(0, 25)}... on ${ExoFormFactory.fieldToString(this.field)}`;
    }
}

class XOFormDataRulesEngine extends ExoRuleEngineBase {

    static TESTS = {
        is: (e, v) => { return e == v },
        in: (e, v) => { return e.includes(v) },
        not: (e, v) => { return e != v },
        gt: (e, v) => { return v > e },
        gte: (e, v) => { return v >= e },
        lt: (e, v) => { return v < e },
        lte: (e, v) => { return v <= e },
        and: (e, v) => { return v & e },
        or: (e, v) => { return v | e },
        match: (e, v) => { return new RegExp(e, "g").test(v) },
        xor: (e, v) => { return v ^ e }
    }

    rules = [];

    checkRules(context, options) {

        this.context = context;
        this.options = options;

        let fields = this.exo.query(field => {
            return Array.isArray(field.rules)
        })
        this.exo.schema.pages.forEach(p => {
            if (Array.isArray(p.rules)) {
                fields.push(p)
            }
        })

        fields.forEach(field => {
            field.rules.forEach(r => {

                this.rules.push(new Rule({
                    field: field,
                    scope: r.condition?.scope,
                    rule: r
                }))

            })
        });

        this.exo.on("dataModelChange", this.checkState.bind(this));

        this.checkState(true)
    }

    checkState(mode) {

        this.rules.forEach(c => {
            try {
                if (mode === true || this.isRuleAffected(mode, c)) {
                    if (c.rule.break) {
                        debugger;
                    }
                    let on = true; 1
                    let test = c.rule.condition?.test;
                    if (test) {
                        let value = this.exo.dataBinding.get(c.scope);
                        const key = Object.keys(test)[0];
                        if (key) {
                            const te = XOFormDataRulesEngine.TESTS[key];
                            if (!te) {
                                throw TypeError(`Missing test criteria in rule ${c}`)
                            }
                            on = te(test[key], value)
                        }
                        else {
                            throw TypeError(`No test parameter found in rule ${c}`);
                        }
                    }
                    this.triggerRule(c, on)
                }
            }
            catch (ex) {
                console.error(`Error in rule ${c} - ${ex}`)
            }
        })
    }

    // determines whether a change in the model affects the given rule
    isRuleAffected(e, r) {
        let path = e.detail?.changeData?.path;
        let scope = r.rule?.condition?.scope || r.field.bind; // if no scope is defined, use field bind 
        if (scope && path)
            return (path.indexOf(scope) > -1)


    }

    triggerRule(c, on) {
        const elm = c.field._control.container;
        if (c.rule.state) {
            switch (c.rule.state) {
                case "visible":
                    if (elm.classList.contains("exf-page")) {
                        this.setPageRelevant(elm, on)
                    }
                    else {
                        console.log("visible", on, elm)
                        xo.dom[on ? "show" : "hide"](elm);
                    }
                    break;
                case "enabled":
                    console.log("enabled", on, elm)
                    xo.dom[on ? "enable" : "disable"](elm);
                    break;
            }
        }
        else if (on && c.rule.action) {
            this.runAction(c.rule.action)
        }
    }

    runAction(act) {

        const getVar = (n, def) => {
            let v = this.exo.dataBinding.get(n);
            return v === undefined ? def : v
        };

        const calc = (a, b, m) => {
            this.exo.dataBinding.set(a, m(getVar(a), getVar(b)));
        }

        const ACTIONS = {
            goto: e => { this.exo.addins.navigation.goto(this.getPage(e)) },
            alert: e => alert(e),
            dialog: e => {
                let dlg = this.exo.get(e);
                dlg._control.show();
            },
            set: (a, b) => {
                this.exo.dataBinding.set(a, b)
            },
            convert: (a, b) => {
                this.exo.dataBinding.set(a, this.convert(a, b));
            },
            sum: (a, b) => {
                calc(a, b, (c, d) => { return c + d })
            },
            subtract: (a, b) => {
                calc(a, b, (c, d) => { return c - d })
            },
            divide: (a, b) => {
                calc(a, b, (c, d) => { return c / d })
            },
            multiply: (a, b) => {
                calc(a, b, (c, d) => { return c * d })
            },
            remainder: (a, b) => {
                calc(a, b, (c, d) => { return c % d })
            },
            power: (a, b) => {
                calc(a, b, (c, d) => { return c ** d })
            },
            ...this.options.rules?.actions
        }

        //debugger

        let action, key = Object.keys(act)[0];

        if (key === "sequence" && Array.isArray(act.sequence)) {
            act.sequence.forEach(f => {
                key = Object.keys(f)[0];
                action = ACTIONS[key];
                action(...f[key] || [])
            })
        }
        else {
            action = ACTIONS[key];
            action(...act[key] || [])
        }


    }

    convert(value, type) {
        value = this.exo.dataBinding.get(value);
        if (typeof (value) === "string") {
            switch (type.substr(0, 3)) {
                case "upp":
                    return value.toUpperCase();
                case "low":
                    return value.toUpperCase();
                case "cap":
                    return value.charAt(0).toUpperCase() + value.slice(1);
            }
        }
        return value;
    }

    setPageRelevant(pageElm, on) {

        console.log("scoped", on, pageElm)

        pageElm[on ? "removeAttribute" : "setAttribute"]("data-skip", "true")

        const page = pageElm.data.field._control;

        this.exo.events.trigger(ExoFormFactory.events.pageRelevancyChange, {
            index: page.index,
            relevant: on
        });
    }

    getPage(p) {
        if (typeof (p) === "string") {
            p = this.exo.schema.pages.find(i => {
                return i.id === p;
            }).index;

        }
        return p;
    }
}

export default XOFormDataRulesEngine;