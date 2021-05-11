import Core from '../pwa/Core';
import ExoFormFactory from './ExoFormFactory';

class ExoFormDataBindingResolver {

    constructor(dataBinding) {
        this.dataBinding = dataBinding;
        this.exo = dataBinding.exo;
        this._boundControlState = [];
    }

    addBoundControl(settings) {
        this._boundControlState.push(settings);
    }

    resolve() {
        this._checkSchemaLogic();

        this._replaceVars(this.exo.container);
        this._bindControlStateToUpdatedModel()
    }

    _resolveVars(str, cb, ar) {

        // https://regex101.com/r/aEsEq7/1 - Match @object.path, @object.path.subpath, @object.path.subpath etc.
        var result = str.replace(
            /(?:^|[\s/+*(-])[@]([A-Za-z_]+[A-Za-z_0-9.]*[A-Za-z_]+[A-Za-z_0-9]*)(?=[\s+/*,.?!)]|$)/gm,
            (match, token) => {
                ar.push(match);
                return " " + cb(token);
            }
        );
        return result;
    }

    _replaceVars(node) {
        let ar = [];

        if (node.nodeType == 3) {
            let s = node.data;
            if (node.parentElement.data && node.parentElement.data.origData) {
                s = node.parentElement.data.origData;
            }

            s = this._resolveVars(s, e => {
                let value = this.dataBinding.get(e, "");
                return value;
            }, ar);

            if (ar.length) {

                if (!node.parentElement.data || typeof (node.parentElement.data.origData) === "undefined") {
                    node.parentElement.data = node.parentElement.data || {};
                    node.parentElement.data.origData = node.data;
                }

                node.data = s;
            }
        }
        if (node.nodeType == 1 && node.nodeName != "SCRIPT") {
            for (var i = 0; i < node.childNodes.length; i++) {
                this._replaceVars(node.childNodes[i]);
            }
        }
    }


    _checkSchemaLogic() {
        const model = this.exo.dataBinding.model;
        if (model && model.logic) {

            if (typeof (model.logic) === "function") {
                this.applyJSLogic(model.logic, null, model)
            }
            else if (model.logic && model.logic.type === "JavaScript") {
                let script = this.assembleScript(model.logic)
                this.applyJSLogic(null, script, model)
            }
        }
    }

    assembleScript(logic) {
        if (logic && Array.isArray(logic.lines)) {

            return `let model = this.dataBinding.model;\n` + logic.lines.join('\n');
        }
        return "";
    }

    applyJSLogic(f, js, model) {
        const context = {
            model: model,
            exo: this.exo
        };
        try {
            if (f) {
                model.logic.bind(this.exo)(context);
            }
            else {
                Core.scopeEval(context, js)
            }
        }
        catch (ex) {
            console.error(ex);
            this.dataBinding._signalDataBindingError(ex);
        }
        finally {

        }
    }

    _bindControlStateToUpdatedModel() {
        
        this._boundControlState.forEach(obj => {
            let value = this.dataBinding.get(obj.path);
            console.debug("Databinding: bindControlStateToUpdatedModel", obj.propertyName, "on", ExoFormFactory.fieldToString(obj.field), "to", value, obj.path);
            obj.control[obj.propertyName] = value;
        });

    }
}

export default ExoFormDataBindingResolver;