
// Simple Vanilla JS Event System
class Emitter {
    constructor(obj) {
        this.obj = obj;
        this.eventTarget = document.createDocumentFragment();
        ["addEventListener", "dispatchEvent", "removeEventListener"]
            .forEach(this.delegate, this);
    }

    delegate(method) {
        this.obj[method] = this.eventTarget[method].bind(this.eventTarget);
    }
}

// Reusable Iterator class:
class Iterator {
    constructor(o, key) {
        this.index = [];
        this.i = 0;
        this.o = o;

        for (var x in o) {
            this.index.push({ 'key': x, 'order': o[x][key] });
        }

        this.index.sort(function (a, b) {
            var as = a['order'],
                bs = b['order'];

            return as == bs ? 0 : (as > bs ? 1 : -1);
        });

        this.len = this.index.length;
    }

    next() {
        return this.i < this.len ?
            this.o[this.index[this.i++]['key']] :
            null;
    }
}

class Core {

    static operatorTable = {
        '>': (a, b) => { return a > b; },
        '<': (a, b) => { return a < b; },
        '>': (a, b) => { return a >= b; },
        '<=': (a, b) => { return a <= b; },
        '===': (a, b) => { return a === b; },
        '!==': (a, b) => { return a !== b; },
        '==': (a, b) => { return a == b; },
        '!=': (a, b) => {
            return a != b;
        },
        '&': (a, b) => { return a & b; },
        '^': (a, b) => { return a ^ b; },
        '&&': (a, b) => { return a && b; }

    };

    static Iterator = Iterator;

    static addEvents(obj) {
        new Emitter(obj);
    }

    static compare(operator, a, b) {
        return this.operatorTable[operator](a, b);
    }

    // get rid of circular references in objects 
    static stringifyJSONWithCircularRefs(json) {
        // Note: cache should not be re-used by repeated calls to JSON.stringify.
        var cache = [];
        var s = JSON.stringify(json, (key, value) => {
            if (typeof value === 'object' && value !== null) {
                // Duplicate reference found, discard key
                if (cache.includes(value)) return;

                // Store value in our collection
                cache.push(value);
            }
            return value;
        }, 2);
        cache = null; // Enable garbage collection
        return s;
    }

    static toPascalCase(s) {
        if (typeof (s) !== "string")
            return s;

        return s.replace(/(\w)(\w*)/g,
            function (g0, g1, g2) { return g1.toUpperCase() + g2.toLowerCase(); });
    }


    static prettyPrintJSON(obj) {
        var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;
        var replacer = function (match, pIndent, pKey, pVal, pEnd) {
            var key = '<span class="json-key" style="color: brown">',
                val = '<span class="json-value" style="color: navy">',
                str = '<span class="json-string" style="color: olive">',
                r = pIndent || '';
            if (pKey)
                r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
            if (pVal)
                r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
            return r + (pEnd || '');
        };

        return JSON.stringify(obj, null, 3)
            .replace(/&/g, '&amp;').replace(/\\"/g, '&quot;')
            .replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(jsonLine, replacer);
    }

    static guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }


    static async waitFor(f, timeoutMs) {
        return new Promise((resolve, reject) => {
            let timeWas = new Date(),
                wait = setInterval(function () {
                    var result = f();
                    if (result) {
                        clearInterval(wait);
                        resolve();
                    } else if (new Date() - timeWas > timeoutMs) { // Timeout
                        clearInterval(wait);
                        reject();
                    }
                }, 20);
        });
    }



    static isValidUrl(urlString) {
        let url;

        try {
            url = new URL(urlString);
        } catch (_) {
            return false;
        }

        return url.protocol === "http:" || url.protocol === "https:";
    }

    static toWords(text) {
        var result = text.replace(/([A-Z])/g, " $1");
        return result.charAt(0).toUpperCase() + result.slice(1);
    }
}

export default Core;