import ExoRuleEngineBase from './ExoRuleEngineBase';
import ExoFormFactory from '../core/ExoFormFactory';

class Rule {
    constructor(o) {
        this.control = o.control;
        this.rule = o.rule;
        this.if = o.rule?.if;
        this.scope = this.if?.property || o.control.context.field.bind;

        if (typeof (this.if) === "object") {
            let keys = Object.keys(this.if);
            if (keys) {
                const index = keys.indexOf('property');
                if (index > -1)
                    keys.splice(index, 1);
                this.compare = keys[0];
            }
        }
    }

    toString() {
        return `${JSON.stringify(this.if || this.rule).substr(0, 25)}... on ${this.control.toString()}`;
    }
}


class XOFormDataRulesEngine extends ExoRuleEngineBase {
    rules = [];

    checkRules(context, options) {
        this.context = context;
        this.options = options;
        this.exo.events.trigger(ExoFormFactory.events.ruleContextReady, {
            context: this
        })

        this.exo.on("dataModelChange", this._checkState.bind(this));

        this._checkState(true)
    }

    // add actions registers
    addActions(control, actions){
        if(actions?.length){
            actions.forEach(r => {
                this.rules.push(new Rule({
                    control: control,
                    rule: r
                }))
            })
        }
    }
    _checkState(mode) {
        
        try{

            if(this.checking){
                return;
            }

            this.checking = true;
            return this._checkState_internal(mode)
        }
        finally{
            this.checking = false;
        }
    }

    _checkState_internal(mode) {
        const TESTS = {
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
            xor: (e, v) => { return v ^ e },
            empty: (e, v) => { return v == null || v === "" },
            nonempty: (e, v) => { return v != null && v !== "" },
            ...this.options.rules?.operators
        }

        this.rules.forEach(c => {

            if (mode === true || this._isAffected(mode, c)) {
                if (c.rule.break) {
                    debugger; // LEAVE THIS HERE!
                }
                let on = true;
                let test = c.rule.if;
                let te;
                if (!test && c.control.type === "button") {
                    on = this.var(c.scope) === c.control.value
                }

                if (test) {
                    let value = this.var(c.scope);

                    if (c.compare) {
                        te = TESTS[c.compare];
                        if (!te) {
                            throw TypeError(`Missing test criteria in rule ${c}`)
                        }
                        on = te(test[c.compare], value);
                    }
                }
                if (on)
                    this._run(c, c.rule.do)
                else if (c.rule.else) {
                    if (te)
                        this._run(c, c.rule.else)
                    else
                        throw TypeError(`Can't execute else clause: missing if rule ${c}`)
                }
            }

        })
    }

    // determines whether a change in the model affects the given rule
    _isAffected(e, r) {
        let path = e.detail?.changeData?.path;

        //check parameters of do {action: [] } arrays
        let isAffected = false;
        if (r.rule?.do) {

            let p = r.rule?.if?.property;
            if (p) {
                if (path.indexOf(p) > -1)
                    return true
            }

            Object.keys(r.rule?.do).forEach(d => {
                if (!isAffected) {
                    let v = r.rule?.do[d];
                    if (Array.isArray(v)) {
                        v.forEach(q => {
                            if (path.indexOf(q) > -1)
                                isAffected = true
                        })
                    }
                }
            })
        }
        if (isAffected)
            return true;

        if (r.scope && path)
            return (path.indexOf(r.scope) > -1)
    }

    _run(c, act) {

        let key = Object.keys(act)[0];

        if (key === "sequence" && Array.isArray(act.sequence)) {
            act.sequence.forEach(f => {
                key = Object.keys(f)[0];
                this._callAction(c, c.control, key, f[key])
            })
        }
        else {
            this._callAction(c, c.control, key, act[key])
        }
    }

    /**
     * Gets a variable from the model
     * @param {String} path 
     * @param {Any} def 
     * @returns {Any} variable value
     */
    var(path, def) {
        try {
            let v = typeof (path) === "string" && path.startsWith("#/") ? this.exo.dataBinding.get(path) : path;
            return v === undefined ? def : v
        }
        catch (ex) {
            console.error(`Could not get ${path} - ${ex.message}`)
        }
    };

    _callAction(c, control, key, b) {
        if (!key)
            return;

        const calc = (a, b, m) => {
            this.exo.dataBinding.set(a, m(this.var(a), this.var(b)));
        }

        const ACTIONS = {
            goto: e => { this.exo.addins.navigation.goto(this._getPage(this.var(e))) },
            next: e => { this.exo.addins.navigation.next() },
            back: e => { this.exo.addins.navigation.back() },
            alert: e => alert(this.var(e)),
            dialog: e => {
                let dlg = this.exo.get(this.var(e));
                dlg.show();
            },
            set: (a, b) => {
                this.exo.dataBinding.set(a, b);
            },
            remove: (a, b, c) => {
                this.exo.dataBinding.remove(a, b, c);
            },
            submit: (a, b) => {
                const result = this.exo.getFormValues();
                console.log("submit: ", result);
            },
            show: a => {
                let on = this.var(a);
                if (control.container.classList.contains("exf-page")) {
                    this._setPageRelevant(control.container, on);
                }
                else {
                    control.visible = on;
                }
            },
            setclass: e => {
                control.container.classList.add(this.var(e));
            },
            enable: a => {
                let on = this.var(a);
                control.disabled = !on;
            },
            fetch: async (url, type, variable) => {
                let result = await fetch(url);
                this.exo.dataBinding.set(variable, await result[type]());
            },
            focus: a => {
                a = this.var(a);
                this.exo.get(a)?.focus();
            },
            convert: (a, b) => {
                const cvt = (value, type) => {
                    value = this.var(value);
                    if (typeof (value) === "string") {
                        switch (type.substr(0, 3)) {
                            case "upp":
                                return value.toUpperCase();
                            case "low":
                                return value.toLowerCase();
                            case "cap":
                                return value.charAt(0).toUpperCase() + value.slice(1);
                        }
                    }
                    return value;
                }

                this.exo.dataBinding.set(a, cvt(a, b));
            },
            navigate: (a) => {
                document.location.href = a
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
            modulus: (a, b) => {
                calc(a, b, (c, d) => { return c % d })
            },
            power: (a, b) => {
                calc(a, b, (c, d) => { return c ** d })
            },
            trigger: (a, b) => {
                const eventName = this.var(a);
                this.exo.events.trigger(eventName, {
                    ...b || {}
                })
            },
            ...this.options.rules?.actions
        }

        const f = ACTIONS[key]
        if (typeof (f) === "function") {
            let args = [...b || []]

            console.debug(`Action called: ${key}(${args})`);

            var bscoped = f.bind(this);
            bscoped(...args)
        }
        else {
            throw TypeError("Action not found: " + key)
        }
    }

    _setPageRelevant(pageElm, on) {
        pageElm[on ? "removeAttribute" : "setAttribute"]("data-skip", "true")

        const page = xo.control.get(pageElm);

        this.exo.events.trigger(ExoFormFactory.events.pageRelevancyChange, {
            index: page.index,
            relevant: on
        });
    }

    _getPage(p) {
        if (typeof (p) === "string") {
            p = this.exo.schema.pages.find(i => {
                return i.id === p;
            }).index;
        }
        return p;
    }
}

export default XOFormDataRulesEngine;