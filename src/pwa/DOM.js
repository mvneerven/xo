import Core from './Core';

class DragDropSorter {
    constructor(masterContainer, selector, childSelector) {
        this.events = new Core.Events(this);

        this.masterContainer = masterContainer;
        this.selector = selector;
        this.childSelector = childSelector;

        this.dragSortContainers = masterContainer.querySelectorAll(selector);

        console.debug("DragDropSorter: dragSortContainers selected for dragdrop sorting: " + this.dragSortContainers.length, ", selector: ", selector);
        this.enableDragList(masterContainer, childSelector);
    }

    enableDragList(container, childSelector) {
        let elements = container.querySelectorAll(childSelector);
        console.debug("DragDropSorter: elements selected for dragdrop sorting: " + elements.length, ", childSelector: ", childSelector);
        elements.forEach(item => {
            this.enableDragItem(item)
        });
    }

    enableDragItem(item) {
        item.setAttribute('draggable', true)
        item.ondrag = e => {
            this.handleDrag(e);
        }
        item.ondragend = e => {
            this.handleDrop(e);
        }
    }

    handleDrag(event) {
        const selectedItem = event.target,
            list = selectedItem.closest(this.selector),
            x = event.clientX,
            y = event.clientY;

        selectedItem.classList.add('drag-sort-active');

        let sortContainer = selectedItem.closest(this.selector);

        if (sortContainer) {
            sortContainer.classList.add("drag-sort-in-process")
            console.debug("drag starts: " + selectedItem.class, ", container:", sortContainer.class);
        }

        let swapItem = document.elementFromPoint(x, y) === null ? selectedItem : document.elementFromPoint(x, y);

        if (list === swapItem.parentNode) {
            swapItem = swapItem !== selectedItem.nextSibling ? swapItem : swapItem.nextSibling;
            list.insertBefore(selectedItem, swapItem);
        }
    }

    handleDrop(event) {
        event.target.classList.remove('drag-sort-active');
        console.debug("DragDropSorter: drag stopped: " + event.target.class)
        let sortContainer = event.target.closest(this.selector);

        if (sortContainer) {
            console.debug("DragDropSorter: Sort container: " + sortContainer.class);
            sortContainer.classList.remove("drag-sort-in-process");
        }
        else {
            //TODO
        }

        this.events.trigger("sort", {
            order: this.getOrder()
        })
    }

    getOrder() {
        return []
    }

    destroy() {
        this.masterContainer.querySelectorAll("[draggable]").forEach(d => {
            d.draggable = false;
            d.ondrag = null;
            d.ondragend = null;
        })
    }

}

/**
 * Document Object Model helper methods
 */
class DOM {

    static DragDropSorter = DragDropSorter;

    // static constructor
    static _staticConstructor = (function () {
        DOM.setupGrid();
    })();

    /**
     * Generates an Html Element from the given HTML string
     * @param {String} html 
     * @returns DOM element
     */
    static parseHTML(html) {
        let parser = new DOMParser(),
            doc = parser.parseFromString(html, 'text/html');
        return doc.body.firstChild;
    }

    static getValue(ctl) {
        if (ctl.type === "select" || ctl.type === "select-one") {
            if (ctl.selectedIndex !== -1)
                return ctl.options[ctl.selectedIndex].value;
            else
                return undefined;
        }

        if (ctl.type === "radio") {
            let e = ctl.closest('[data-name="' + ctl.name + '"]').querySelector(":checked");
            return e ? e.value : undefined;
        }


        return ctl.value;
    }

    static setValue(ctl, value) {
        ctl.value = value;
    }

    static elementPath(e) {

        //e.path.join('/')
        return e.toString();
    }

    /**
     * Returns string representation of HtmlElement using nodeName, id and classes
     * @param {Object} el - the DOMM element
     * @returns String 
     */
    static elementToString(el) {
        let s = [];
        if (el && el.nodeName) {
            s.push(el.nodeName);

        }
        if (el.form) {
            if (el.nodeName === "INPUT") {
                s.push("[type=" + (el.type || "text") + "]");
            }
            if (el.name) {
                s.push(":" + el.name)
            }

        }
        if (el.id) {
            s.push('#', el.id)
        }
        if (el.classList && el.classList.length) {
            s.push('.');
            s.push(Array(el.classList).join('.'));
        }

        return s.join('');
    }

    static hide(ctl) {
        ctl.style.display = "none";
    }

    static show(ctl) {
        ctl.style.display = "block";
    }

    static enable(ctl) {
        ctl.removeAttribute("disabled");
    }

    static disable(ctl) {
        ctl.setAttribute("disabled", "disabled");
    }

    static trigger(el, type, x) {
        let ev = new Event(type);
        ev.detail = x;
        el.dispatchEvent(ev);
    }

    static throttleResize(elm, callback) {
        let delay = 100, timeout;
        callback();

        elm.addEventListener("resize", e => {
            clearTimeout(timeout);
            timeout = setTimeout(callback, delay);
        });
    }

    static changeHash(anchor) {
        history.replaceState(null, null, document.location.pathname + '#' + anchor);
    };

    static prettyPrintHTML(str) {
        var div = document.createElement('div');
        div.innerHTML = str.trim();

        return DOM.formatHTMLNode(div, 0).innerHTML.trim();
    }

    static formatHTMLNode(node, level) {

        var indentBefore = new Array(level++ + 1).join('  '),
            indentAfter = new Array(level - 1).join('  '),
            textNode;

        for (var i = 0; i < node.children.length; i++) {

            textNode = document.createTextNode('\n' + indentBefore);
            node.insertBefore(textNode, node.children[i]);

            DOM.formatHTMLNode(node.children[i], level);

            if (node.lastElementChild == node.children[i]) {
                textNode = document.createTextNode('\n' + indentAfter);
                node.appendChild(textNode);
            }
        }

        return node;
    }

    static setupGrid() {
        const html = document.querySelector("HTML");
        const setC = (width, height) => {
            const prefix = "nsp-",
                sizes = { "xs": 768, "sm": 992, "md": 1200, "lg": 1440, "xl": 1920, "uw": 2300 };

            var cls = prefix + "xs";
            for (var i in sizes) {
                html.classList.remove(prefix + i);
                if (width > sizes[i])
                    cls = prefix + i;
            };

            html.classList.remove("nsp-portrait");
            html.classList.remove("nsp-landscape");
            html.classList.add(width > height ? "nsp-landscape" : "nsp-portrait");

            html.classList.add(cls);
        }
        DOM.throttleResize(window, e => {
            setC(window.innerWidth, window.innerHeight);
        });
    }

    static parseCSS(css) {
        let doc = document.implementation.createHTMLDocument(""),
            styleElement = document.createElement("style");

        styleElement.textContent = css;
        // the style will only be parsed once it is added to a document
        doc.body.appendChild(styleElement);
        return styleElement.sheet.cssRules;
    };

    // Wait For an element in the DOM
    static waitFor(selector, limit) {
        if (!limit) limit = 1000;
        return Core.waitFor(() => {
            return document.querySelector(selector);
        }, limit)
    }


    static require(src, c) {
        var d = document;
        let elm = d.head.querySelector(`script[src="${src}"]`);
        if (elm) {
            let loadState = elm.getAttribute("data-exf-rl");
            if (loadState) {
                if (loadState === "1") {
                    elm.addEventListener("load", ev => {
                        ev.target.setAttribute("data-exf-rl", "2");
                        if (typeof (c) === "function") {
                            c();
                        }
                    })
                }
                else if (loadState === "2" && typeof (c) === "function") {
                    c();
                }
                return;
            }
        }

        return new Promise((resolve, reject) => {
            const check = () => {
                if (typeof (c) === "function") {
                    c();
                }
                resolve();
            }
            let e = d.createElement('script');
            e.setAttribute("data-exf-rl", "1");
            e.src = src
            d.head.appendChild(e);
            e.onload = ev => {
                ev.target.setAttribute("data-exf-rl", "2");
                check()
            }
        });
    }

    static addStyleSheet(src, attr) {
        var d = document;
        if (d.querySelector("head > link[rel=stylesheet][href='" + src + "']"))
            return;

        let e = d.createElement('link');
        e.rel = "stylesheet";
        e.href = src;
        if (attr) {
            for (var a in attr) {
                e.setAttribute(a, attr[a]);
            }
        }
        d.head.appendChild(e);

    }



    static format(template, data, settings) {
        settings = settings || { empty: '' };

        // Check if the template is a string or a function
        template = typeof (template) === 'function' ? template() : template;
        if (['string', 'number'].indexOf(typeof template) === -1) throw 'Placeholders: please provide a valid template';

        // If no data, return template as-is
        if (!data) return template;

        // Replace our curly braces with data
        template = template.replace(/\{\{([^}]+)\}\}/g, function (match) {

            // Remove the wrapping curly braces
            match = match.slice(2, -2);

            // Get the value
            var val = Core.getObjectValue(data, match.trim());

            // Replace
            if (!val) return settings.empty !== undefined ? settings.empty : '{{' + match + '}}';
            return val;

        });
        return template;
    }



    static replace(oldElm, newElm) {
        let dummy = oldElm;
        dummy.parentNode.insertBefore(newElm, dummy);
        dummy.remove();
        return newElm;
    }

    static unwrap(el) {
        var parent = el.parentNode;
        while (el.firstChild) parent.insertBefore(el.firstChild, el);
        parent.removeChild(el);
        return parent;
    }

    static copyToClipboard(elm) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(elm);
        selection.removeAllRanges();
        selection.addRange(range);
        const successful = document.execCommand('copy');
        window.getSelection().removeAllRanges()
        return successful;
    }

    static maskInput(input, options) {
        let pattern = options.pattern;
        let mask = options.mask;
        const doFormat = (x, pattern, mask) => {
            var strippedValue = x.replace(/[^0-9]/g, "");
            var chars = strippedValue.split('');
            var count = 0;

            var formatted = '';
            for (var i = 0; i < pattern.length; i++) {
                const c = pattern[i];
                if (chars[count]) {
                    if (/\*/.test(c)) {
                        formatted += chars[count];
                        count++;
                    } else {
                        formatted += c;
                    }
                } else if (mask) {
                    if (mask.split('')[i])
                        formatted += mask.split('')[i];
                }
            }
            return formatted;
        }


        const format = (elem) => {
            const val = doFormat(elem.value, elem.getAttribute('data-format'));
            elem.value = doFormat(elem.value, elem.getAttribute('data-format'), elem.getAttribute('data-mask'));

            if (elem.createTextRange) {
                var range = elem.createTextRange();
                range.move('character', val.length);
                range.select();
            } else if (elem.selectionStart) {
                elem.focus();
                elem.setSelectionRange(val.length, val.length);
            }
        }

        input.addEventListener('keyup', function () {
            format(input);
        });
        input.addEventListener('keydown', function () {
            format(input);
        });
        format(input)

    }


}

export default DOM;
