import Core from '../../pwa/Core';
import ExoFormFactory from '../core/ExoFormFactory';

class ExoFormDataBindingResolver {

    constructor(dataBinding) {
        this.dataBinding = dataBinding;
        this.exo = dataBinding.exo;
        this._boundControlState = [];
        this._hash = {};

    }

    addBoundControl(settings) {
        let h = `${ExoFormFactory.fieldToString(settings.field)}.${settings.propertyName}.${settings.field._index}`;

        if(!this._hash[h]){
            this._hash[h] = 1;
            this._boundControlState.push(settings);
        }
    }

    resolve(changedData) {
        try {
            this.dataBinding.noProxy = true;
            this._checkSchemaLogic(changedData);
            this._replaceVars(this.exo.container, changedData);
            this._bindControlStateToUpdatedModel(changedData)
        }
        finally {
            this.dataBinding.noProxy = false;
        }
    }

    _replaceVars(node, changedData) {
        let ar = [];

        if (node.nodeType == 3) {
            let s = node.data;
            if (node.parentElement?.data?.origData) {
                s = node.parentElement.data.origData;
            }

            s = Core.resolveVariables(s, e => {
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
                this._replaceVars(node.childNodes[i], changedData);
            }
        }
    }

    // Run logic in schema at dataModelChange
    _checkSchemaLogic(changedData) {

        changedData = changedData || {};

        const model = this.exo.dataBinding.model;
        if (model?.logic) {

            if (typeof (model.logic) === "function") {
                this.applyJSLogic(model.logic, null, model, changedData)
            }
            else if (model.logic && model.logic.type === "JavaScript") {
                let script = this.assembleScript(model.logic)
                this.applyJSLogic(null, script, model, changedData)
            }
        }
    }

    assembleScript(logic) {
        if (Array.isArray(logic?.lines)) {
            return `const context = {model: this.exo.dataBinding.model, exo: this, changed: this.changed};\n` + logic.lines.join('\n');
        }
        return "";
    }

    applyJSLogic(f, js, model, changedData) {
        const context = {
            model: model,
            exo: this.exo,
            changed: changedData
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

    _bindControlStateToUpdatedModel(changedData) {

        this._boundControlState.forEach(obj => {

            if(!changedData?.path || obj.path === changedData?.path){

                let value = this.dataBinding.get(obj.path);
                if (obj.propertyName === "bind") {
                    obj.control.value = value;
                }

                obj.control[obj.propertyName] = value;

                obj.updatedValue = value
            }
        });
    }
}

export default ExoFormDataBindingResolver;