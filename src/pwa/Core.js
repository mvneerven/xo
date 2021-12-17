import Events from './Events';
import MarkDown from './MarkDown';
import SimpleCache from './SimpleCache';

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

/**
 * Core utility methods
 * @category Test
 */
class Core {

    static Iterator = Iterator;

    /**
     * Events Class
     */
    static Events = Events;

    /**
     * MarkDown wrapper
     */
    static MarkDown = MarkDown;

    /**
     * Caching class
     */
    static SimpleCache = SimpleCache;

    static operatorTable = {
        '>': (a, b) => { return a > b; },
        '<': (a, b) => { return a < b; },
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

    /**
     * Clone an object.
     * @param {Object} obj 
     * @param {Function} replacer
     * @returns cloned object.
     */
    static clone(obj, replacer) {
        // https://stackoverflow.com/questions/53102700/how-do-i-turn-an-es6-proxy-back-into-a-plain-object-pojo
        if(typeof(obj) !== "object")
            return obj;
        return JSON.parse(JSON.stringify(obj, replacer));
    }

    /**
     * Generates a device fingerprint based on rendering data on a canvas element - See https://en.wikipedia.org/wiki/Canvas_fingerprinting
     * @returns {String} - An identifier known to be relatively unique per device
     */
    static fingerprint() {
        const ca = document.createElement("canvas"),
            co = ca.getContext("2d");
        co.fillText("Lorem ipsum", 20, 20);
        let s = ca.toDataURL("image/png"),
            x = document.getElementById("canvas-fingerprint");
        return s.split("").reduce((a, b) => {
            a = (a << 5) - a + b.charCodeAt(0);
            return a & a;
        }, 0);
    }

    static addEvents(obj) {
        new Emitter(obj);
    }

    static calcAge(dateValue) {
        const date = new Date(dateValue);
        const [year, month, day] = [date.getFullYear(), date.getMonth(), date.getDay()];
        let today = new Date();
        let age = today.getFullYear() - year;
        if (today.getMonth() < month || (today.getMonth() == month && today.getDate() < day)) {
            age--;
        }
        return age;
    }
    /**
     * Converts a data URL to a Blob and returns a Blob URL.
     * @param {URL} dataurl 
     * @returns Blob URL
     */
    static dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return URL.createObjectURL(new Blob([u8arr], { type: mime }));
    }

    /**
     * Converts a Blob into a dataUrl
     * @param {*} blob 
     * @returns data URL
     */
    static async blobToDataURL(blob) {
        return new Promise((resolve) => {
            var a = new FileReader();
            a.onload = function (e) { resolve(e.target.result) };
            a.readAsDataURL(blob);
        })
    }

    static async jsonToDataUrl(json) {
        let txt = JSON.stringify(json, null, 2);
        var blob = new Blob([txt], { type: "application/json" });
        return await Core.blobToDataURL(blob);
    }


    /**
     * 
     * @param {Object} obj - the object to get a property from
     * @param {String} path - path to the property
     * @param {Any} def - default to return if the property is undefined
     * @returns The value of the property as retrieved
     */
    static getObjectValue(obj, path, def) {
        // Get the path as an array

        path = Core.translateBindingPath(path)

        path = Core.stringToPath(path);
        // Cache the current object
        var current = obj;

        // For each item in the path, dig into the object
        for (var i = 0; i < path.length; i++) {
            // If the item isn't found, return the default (or null)
            if (typeof (current[path[i]]) === undefined) return def;
            // Otherwise, update the current  value
            current = current[path[i]];
        }
        return current;
    }

    static translateBindingPath(path) {

        if (path.startsWith("#/")) {
            path = "instance." + Core.replaceAll(path.substr(2), "/", ".");
        }

        return path;
    }


    static replaceAll(str, find, replace) {
        return str.replace(new RegExp(Core.escapeRegExp(find), 'g'), replace);
    }

    static escapeRegExp(string) {
        return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    /**
     * Does JS code stringification comparable to JSON.stringify()
     * @param {Object} jsLiteral - the JavaScript literal to stringify 
     * @param {Function} replacer 
     * @param {Number} indent 
     * @returns String
     */
    static stringifyJs(jsLiteral, replacer, indent) {
        const sfy = (o, replacer, indent, level) => {


            let type = typeof o,
                tpl,
                tab = (lvl) => " ".repeat(indent * lvl);

            if (o === null) {
                return "null"
            }
            else if (o === undefined) {
                return "undefined"
            }
            else if (type === "function") {
                return o.toString();
            }

            if (type !== "object") {
                return JSON.stringify(o, replacer);
            } else if (Array.isArray(o)) {
                let s = "[\n";

                let ar = [];
                level++;
                s += tab(level);

                o.forEach((i) => {
                    ar.push(sfy(i, replacer, indent, level));
                });

                s += ar.join(',\n' + tab(level));
                level--;
                s += "\n" + tab(level) + "]";
                return s;
            }

            let result = "";
            level++;
            result += "{\n" + tab(level);
            let props = Object.keys(o)
                .filter(key => {
                    return !key.startsWith("_")
                })
                .map((key) => {
                    return `${key}: ${sfy(o[key], replacer, indent, level)}`;
                })

                .join(',\n' + tab(level));

            result += props + "\n";
            level--;
            result += tab(level) + "}"

            return result;
        };

        let level = 0;
        return sfy(jsLiteral, replacer, indent, level);
    }

    /**
     * Evaluates a script in the given scope
     * @param {Object} scope - the 'this' scope for the script to run in
     * @param {String} script - the script to execute
     * @returns The return value of the script, if any
     */
    static scopeEval(scope, script) {
        return Function('"use strict";' + script).bind(scope)();
    }

    /**
     * Resolve variables in strings
     * @param {*} str - the string to parse
     * @param {*} cb - callback for each var replacement
     * @param {*} ar - array to fill with matches
     * @returns the string with the resolved variables
     */
    static resolveVariables(str, cb, ar) {

        // https://regex101.com/r/aEsEq7/1 - Match @object.path, @object.path.subpath, @object.path.subpath etc.
        // var result = str.replace(
        //     /(?:^|[\s/+*(-])[@]([A-Za-z_]+[A-Za-z_0-9.]*[A-Za-z_]+[A-Za-z_0-9]*)(?=[\s+/*,.?!)]|$)/gm,
        //     (match, token) => {
        //         ar.push(match);
        //         return " " + cb(token);
        //     }
        // );

        // https://regex101.com/r/otpGr5/1
        var result = str.replace(
            /(?:^|[\s/+*(-])(#\/[A-Za-z_]+[A-Za-z_0-9/]*[A-Za-z_]+[A-Za-z_0-9]*)(?=[\s+/*,.?!;)]|$)/gm,
            (match, token) => {
                ar.push(match);
                return " " + cb(token);
            }
        );



        return result;
    }

    /**
     * Acquire state from multiple possible sources.
     * @param {Any} data - input data. Can be either direct data, URL, function or Promise
     * @param {*} options - optional options to pass to Promise, function
     * @returns Object or Array 
     */
    static async acquireState(data, options) {
        options = options || {
            process: (data, fetched) => {
                return data;
            }
        }

        return new Promise((resolve) => {
            const process = async (data) => {
                data = await options.process(data, options);
                resolve(data)
            }

            if (Core.isUrl(data)) {
                fetch(data).then((x) => {
                    if (x.status === 200) {
                        process(x.json(), true);
                        return;
                    }
                    throw new Error(`HTTP error ${x.status} - ${data}`);
                });
            } else if (Array.isArray(data) || typeof (data) === "object") {
                process(data);
            } else if (typeof data === "function") {
                process(data(options || {}));
            } else {
                return process(Promise.resolve(data));
            }
        });
    }

    /**
     * Checks whether the fiven string is a valid URL.
     * @param {String} txt - the string to evaluate
     * @returns Boolean indeicating whether the string is a URL.
     */
    static isUrl(txt) {
        try {
            if (typeof (txt) !== "string")
                return false;
            if (txt.indexOf("\n") !== -1 || txt.indexOf(" ") !== -1)
                return false;
            if (txt.startsWith("#/"))
                return false;
            new URL(txt, window.location.origin)
            return true;
        }
        catch { }
        return false;
    }

    /**
     * Counterpart of GetObjectValue
     * @param {Object} obj - the object to set a shallow or deep property on
     * @param {String} path - the path to the property to set
     * @param {Any} value - the value to set
     */
    static setObjectValue(obj, path, value) {

        path = Core.translateBindingPath(path)

        // Get the path as an array
        path = Core.stringToPath(path);

        // Cache the current object
        var current = obj;

        // For each item in the path, dig into the object
        for (var i = 0; i < path.length; i++) {
            current = current[path[i]];

            if (i === path.length - 2) {
                current[path[i + 1]] = value;
            }
        }
    }

    /**
     * Does a deep merge of two objects, whereas using the spread operator (...) only does a shallow merge.
     * @param {Object} obj1 - the object to be merged into
     * @param {Object} obj2 - the object to be merged from
     */
    static deepMerge(obj1, obj2) {
        for (var p in obj2) {
            if (typeof (obj2[p]) === "object") {
                if (obj1[p]) {
                    Core.deepMerge(obj1[p], obj2[p])
                }
                else {
                    obj1[p] = obj2[p];
                }
            }
            else {
                //obj1[p] = obj2[p] || obj1[p]
                obj1[p] = {
                    ...obj1[p],
                    ...obj2[p]
                }
            }
        }
    }

    /**
     * Helper for GetObjectProperty and GetObjectProperty
     * @param {String} path 
     * @returns Array
     */
    static stringToPath(path) {

        // If the path isn't a string, return it
        if (typeof path !== 'string') return path;

        // Create new array
        var output = [];

        // Split to an array with dot notation
        path.split('.').forEach(function (item) {

            // Split to an array with bracket notation
            item.split(/\[([^}]+)\]/g).forEach(function (key) {

                // Push to the new array
                if (key.length > 0) {
                    output.push(key);
                }
            });
        });
        return output;
    }

    static objectEquals(x, y) {
        if (x === null || x === undefined || y === null || y === undefined) { return x === y; }
        // after this just checking type of one would be enough
        if (x.constructor !== y.constructor) { return false; }
        // if they are functions, they should exactly refer to same one (because of closures)
        if (x instanceof Function) { return x === y; }
        // if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
        if (x instanceof RegExp) { return x === y; }
        if (x === y || x.valueOf() === y.valueOf()) { return true; }
        if (Array.isArray(x) && x.length !== y.length) { return false; }

        // if they are dates, they must had equal valueOf
        if (x instanceof Date) { return false; }

        // if they are strictly equal, they both need to be object at least
        if (!(x instanceof Object)) { return false; }
        if (!(y instanceof Object)) { return false; }

        // recursive object equality check
        var p = Object.keys(x);
        return Object.keys(y).every(function (i) { return p.indexOf(i) !== -1; }) &&
            p.every(function (i) { return Core.objectEquals(x[i], y[i]); });
    }

    /**
     * Compares values using the built in operator table
     * @param {String} operator 
     * @param {Object} a 
     * @param {Object} b 
     * @returns Boolean
     */
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

    static formatValue(value, options) {
        options = options || { type: "currency", country: "nl", currencyCode: "EUR" }

        if (options.type === "currency")
            return new Intl.NumberFormat(options.country,
                { style: 'currency', currency: options.currencyCode }).format(value);

    }


    static toPascalCase(s) {
        if (typeof (s) !== "string")
            return s;

        return s.replace(/(\w)(\w*)/g,
            function (g0, g1, g2) { return g1.toUpperCase() + g2.toLowerCase(); });
    }

    /**
     * Returns a random GUID
     * @returns string (36 characters)
     */
    static guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Waits for a given condition in a promise.
     * @param {Function} f - the function to evaluate whether waiting should end
     * @param {Number} timeoutMs - total time to wait if the given function still doesn't return true 
     * @param {Number} intervalMs - interval to wait between each function evaluation (in milliseconds) - Defaults to 20.
     * @returns Promise that resolves when the evaluating function provided return true, or gets rejected when the timeout is reached.
     */
    static async waitFor(f, timeoutMs, intervalMs) {
        intervalMs = intervalMs || 20;
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
                }, intervalMs);
        });
    }

    /**
     * Formats a number as human-friendly byte size
     * @param {Number} size 
     * @returns String like 20KB, 1.25MB, 6.25GB, etc.
     */
    static formatByteSize(size) {
        // Setup some constants
        const LN1024 = Math.log(1024), // This converts from log in base e to log in base 1024.
            // For LN1024 we can also just use the constant 6.9314718055994530941723212145818 which is what this evaluates to
            units = ['B', 'KB', 'MB', 'GB'], // A simple map to convert the exponent to a unit marker. exponent 0 is Byte, exponent 1 is Kilobytes, etc

            // Calculate our exponent (How many units to move)
            exp = Math.floor(Math.min(Math.log(size) / LN1024, 3)), // We'll clamp to a max of 3 orders of magnitude (GB)

            // If we divide our number by base^exp then we've converted it to the correct unit space
            divisor = Math.pow(1024, exp),

            // Put it together and we arrive at our human readable file size
            readable = Math.floor(size / divisor) + units[exp];
        return readable;
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