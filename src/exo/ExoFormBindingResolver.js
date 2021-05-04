class ExoFormBindingResolver {

    constructor(exo) {
        this.exo = exo;
    }

    resolve() {
        this._replaceVars(this.exo.container);
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
                let value = this._getVar(e);
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

    _getVar(path) {
        return this.exo.dataModel.get(path, "");
    }
}

export default ExoFormBindingResolver;