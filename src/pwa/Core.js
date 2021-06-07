import Events from './Events';
import MarkDown from './MarkDown';

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
 */
class Core {

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

    static Iterator = Iterator;

    static Events = Events;

    static MarkDown = MarkDown;

    static addEvents(obj) {
        new Emitter(obj);
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

            if (type === "function") {
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

                s += ar.join(',');
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
     * Helper for GetObjectProperty and GetObjectProperty
     * @param {String} path 
     * @returns 
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

    /**
     * Compares values using the built in operator table
     * @param {String} operator 
     * @param {Object} a 
     * @param {Object} b 
     * @returns 
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