(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('regenerator-runtime/runtime')) :
  typeof define === 'function' && define.amd ? define(['regenerator-runtime/runtime'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.xo = factory());
}(this, (function () { 'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  // Simple Vanilla JS Event System
  class Emitter {
    constructor(obj) {
      this.obj = obj;
      this.eventTarget = document.createDocumentFragment();
      ["addEventListener", "dispatchEvent", "removeEventListener"].forEach(this.delegate, this);
    }

    delegate(method) {
      this.obj[method] = this.eventTarget[method].bind(this.eventTarget);
    }

  } // Reusable Iterator class:


  class Iterator {
    constructor(o, key) {
      this.index = [];
      this.i = 0;
      this.o = o;

      for (var x in o) {
        this.index.push({
          'key': x,
          'order': o[x][key]
        });
      }

      this.index.sort(function (a, b) {
        var as = a['order'],
            bs = b['order'];
        return as == bs ? 0 : as > bs ? 1 : -1;
      });
      this.len = this.index.length;
    }

    next() {
      return this.i < this.len ? this.o[this.index[this.i++]['key']] : null;
    }

  }

  class Core {
    static addEvents(obj) {
      new Emitter(obj);
    }

    static compare(operator, a, b) {
      return this.operatorTable[operator](a, b);
    } // get rid of circular references in objects 


    static stringifyJSONWithCircularRefs(json) {
      // Note: cache should not be re-used by repeated calls to JSON.stringify.
      var cache = [];
      var s = JSON.stringify(json, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          // Duplicate reference found, discard key
          if (cache.includes(value)) return; // Store value in our collection

          cache.push(value);
        }

        return value;
      }, 2);
      cache = null; // Enable garbage collection

      return s;
    }

    static toPascalCase(s) {
      if (typeof s !== "string") return s;
      return s.replace(/(\w)(\w*)/g, function (g0, g1, g2) {
        return g1.toUpperCase() + g2.toLowerCase();
      });
    }

    static prettyPrintJSON(obj) {
      var jsonLine = /^( *)("[\w]+": )?("[^"]*"|[\w.+-]*)?([,[{])?$/mg;

      var replacer = function (match, pIndent, pKey, pVal, pEnd) {
        var key = '<span class="json-key" style="color: brown">',
            val = '<span class="json-value" style="color: navy">',
            str = '<span class="json-string" style="color: olive">',
            r = pIndent || '';
        if (pKey) r = r + key + pKey.replace(/[": ]/g, '') + '</span>: ';
        if (pVal) r = r + (pVal[0] == '"' ? str : val) + pVal + '</span>';
        return r + (pEnd || '');
      };

      return JSON.stringify(obj, null, 3).replace(/&/g, '&amp;').replace(/\\"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(jsonLine, replacer);
    }

    static guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : r & 0x3 | 0x8;
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
          } else if (new Date() - timeWas > timeoutMs) {
            // Timeout
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

  _defineProperty(Core, "operatorTable", {
    '>': (a, b) => {
      return a > b;
    },
    '<': (a, b) => {
      return a < b;
    },
    '>': (a, b) => {
      return a >= b;
    },
    '<=': (a, b) => {
      return a <= b;
    },
    '===': (a, b) => {
      return a === b;
    },
    '!==': (a, b) => {
      return a !== b;
    },
    '==': (a, b) => {
      return a == b;
    },
    '!=': (a, b) => {
      return a != b;
    },
    '&': (a, b) => {
      return a & b;
    },
    '^': (a, b) => {
      return a ^ b;
    },
    '&&': (a, b) => {
      return a && b;
    }
  });

  _defineProperty(Core, "Iterator", Iterator);

  class DragDropSorter {
    constructor(masterContainer, selector, childSelector) {
      Core.addEvents(this); // add simple event system

      this.masterContainer = masterContainer;
      this.selector = selector;
      this.childSelector = childSelector;
      this.dragSortContainers = masterContainer.querySelectorAll(selector);
      console.debug("dragSortContainers selected for dragdrop sorting: " + this.dragSortContainers.length, ", selector: ", selector);
      this.enableDragList(masterContainer, childSelector);
    }

    triggerEvent(eventName, detail) {
      console.debug("Triggering event", eventName, "detail: ", detail);
      let ev = new Event(eventName);
      ev.detail = detail;
      this.dispatchEvent(ev);
    }

    on(eventName, func) {
      console.debug("Listening to event", eventName, func);
      this.addEventListener(eventName, func);
      return this;
    }

    enableDragList(container, childSelector) {
      let elements = container.querySelectorAll(childSelector);
      console.debug("Elements selected for dragdrop sorting: " + elements.length, ", childSelector: ", childSelector);
      elements.forEach(item => {
        this.enableDragItem(item);
      });
    }

    enableDragItem(item) {
      item.setAttribute('draggable', true);

      item.ondrag = e => {
        this.handleDrag(e);
      };

      item.ondragend = e => {
        this.handleDrop(e);
      };
    }

    handleDrag(event) {
      const selectedItem = event.target,
            list = selectedItem.closest(this.selector),
            x = event.clientX,
            y = event.clientY;
      selectedItem.classList.add('drag-sort-active');
      let sortContainer = selectedItem.closest(this.selector);

      if (sortContainer) {
        sortContainer.classList.add("drag-sort-in-process");
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
      console.debug("drag stopped: " + event.target.class);
      let sortContainer = event.target.closest(this.selector);

      if (sortContainer) {
        console.debug("Sort container: " + sortContainer.class);
        sortContainer.classList.remove("drag-sort-in-process");
      } else {
        debugger;
      }

      this.triggerEvent("sort", {
        order: this.getOrder()
      });
    }

    getOrder() {
      return [];
    }

    destroy() {
      this.masterContainer.querySelectorAll("[draggable]").forEach(d => {
        d.draggable = false;
        d.ondrag = null;
        d.ondragend = null;
      });
    }

  }

  class DOM {
    // static constructor
    static parseHTML(html) {
      let parser = new DOMParser(),
          doc = parser.parseFromString(html, 'text/html');
      return doc.body.firstChild;
    }

    static getValue(ctl) {
      DOM._checkNull('getValue', ctl);

      if (ctl.type === "select" || ctl.type === "select-one") {
        if (ctl.selectedIndex !== -1) return ctl.options[ctl.selectedIndex].value;else return undefined;
      }

      if (ctl.type === "radio") {
        let e = ctl.closest('[data-name="' + ctl.name + '"]').querySelector(":checked");
        return e ? e.value : undefined;
      }

      return ctl.value;
    }

    static setValue(ctl, value) {
      DOM._checkNull('setValue', ctl);

      ctl.value = value;
    }

    static elementPath(e) {
      //e.path.join('/')
      return e.toString();
    } // returns string representation of HtmlElement 
    // using nodeName, id and classes


    static elementToString(el) {
      DOM._checkNull('elementToString', el);

      let s = [];

      if (el && el.nodeName) {
        s.push(el.nodeName);
      }

      if (el.id) {
        s.push('#', el.id);
      }

      if (el.classList && el.classList.length) {
        s.push('.');
        s.push(Array(el.classList).join('.'));
      }

      return s.join('');
    }

    static _checkNull(fName, c) {// if (!c) {
      //     let s = "No element passed to " + fName + "()";
      //     console.error(s)
      //     throw s;
      // }
    }

    static hide(ctl) {
      DOM._checkNull('hide', ctl);

      ctl.style.display = "none";
    }

    static show(ctl) {
      DOM._checkNull('show', ctl);

      ctl.style.display = "block";
    }

    static enable(ctl) {
      DOM._checkNull('enable', ctl);

      ctl.removeAttribute("disabled");
    }

    static disable(ctl) {
      DOM._checkNull('disable', ctl);

      ctl.setAttribute("disabled", "disabled");
    }

    static trigger(el, type, x) {
      DOM._checkNull('trigger', el);

      let ev = new Event(type);
      ev.detail = x;
      el.dispatchEvent(ev);
    }

    static throttleResize(elm, callback) {
      DOM._checkNull('throttleResize', elm);

      let delay = 100,
          timeout;
      callback();
      elm.addEventListener("resize", e => {
        clearTimeout(timeout);
        timeout = setTimeout(callback, delay);
      });
    }

    static changeHash(anchor) {
      history.replaceState(null, null, document.location.pathname + '#' + anchor);
    }

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
              sizes = {
          "xs": 768,
          "sm": 992,
          "md": 1200,
          "lg": 1440,
          "xl": 1920,
          "uw": 2300
        };
        var cls = prefix + "xs";

        for (var i in sizes) {
          html.classList.remove(prefix + i);
          if (width > sizes[i]) cls = prefix + i;
        }
        html.classList.remove("nsp-portrait");
        html.classList.remove("nsp-landscape");
        html.classList.add(width > height ? "nsp-landscape" : "nsp-portrait");
        html.classList.add(cls);
      };

      DOM.throttleResize(window, e => {
        setC(window.innerWidth, window.innerHeight);
      });
    }

    static parseCSS(css) {
      let doc = document.implementation.createHTMLDocument(""),
          styleElement = document.createElement("style");
      styleElement.textContent = css; // the style will only be parsed once it is added to a document

      doc.body.appendChild(styleElement);
      return styleElement.sheet.cssRules;
    }

    // Wait For an element in the DOM
    static waitFor(selector, limit) {
      if (!limit) limit = 1000;
      return Core.waitFor(() => {
        return document.querySelector(selector);
      }, limit);
    }

    static require(src, c) {
      if (typeof src == "string") src = [src];
      var d = document;
      let loaded = 0;
      return new Promise((resolve, reject) => {
        const check = () => {
          if (loaded === src.length) {
            if (typeof c === "function") {
              c();
            }

            resolve();
          }
        };

        src.forEach(s => {
          let e = d.createElement('script');
          e.src = s;
          d.head.appendChild(e);

          e.onload = e => {
            loaded++;
            check();
          };
        });
      });
    }

    static addStyleSheet(src, attr) {
      var d = document;
      if (d.querySelector("head > link[rel=stylesheet][href='" + src + "']")) return;
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

    static getObjectValue(obj, path, def) {


      path = DOM.stringToPath(path); // Cache the current object

      var current = obj; // For each item in the path, dig into the object

      for (var i = 0; i < path.length; i++) {
        // If the item isn't found, return the default (or null)
        if (!current[path[i]]) return def; // Otherwise, update the current  value

        current = current[path[i]];
      }

      return current;
    }

    static format(template, data, settings) {
      settings = settings || {
        empty: ''
      }; // Check if the template is a string or a function

      template = typeof template === 'function' ? template() : template;
      if (['string', 'number'].indexOf(typeof template) === -1) throw 'Placeholders: please provide a valid template'; // If no data, return template as-is

      if (!data) return template; // Replace our curly braces with data

      template = template.replace(/\{\{([^}]+)\}\}/g, function (match) {
        // Remove the wrapping curly braces
        match = match.slice(2, -2); // Get the value

        var val = DOM.getObjectValue(data, match.trim()); // Replace

        if (!val) return settings.empty !== undefined ? settings.empty : '{{' + match + '}}';
        return val;
      });
      return template;
    }

    static stringToPath(path) {
      // If the path isn't a string, return it
      if (typeof path !== 'string') return path; // Create new array

      var output = []; // Split to an array with dot notation

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
      window.getSelection().removeAllRanges();
      return successful;
    }

    static maskInput(input, options) {
      options.pattern;
      options.mask;

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
            if (mask.split('')[i]) formatted += mask.split('')[i];
          }
        }

        return formatted;
      };

      const format = elem => {
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
      };

      input.addEventListener('keyup', function () {
        format(input);
      });
      input.addEventListener('keydown', function () {
        format(input);
      });
      format(input);
    }

  }

  _defineProperty(DOM, "DragDropSorter", DragDropSorter);

  _defineProperty(DOM, "_staticConstructor", function () {
    DOM.setupGrid();
  }());

  /**
   * ExoForm class. 
   * Created using ExoFormContext create() method
   * 
   * @hideconstructor
   */

  class ExoForm {
    static setup() {} // reserved for later


    constructor(context, opts) {
      _defineProperty(this, "defaults", {
        type: "form",
        baseUrl: document.location.origin,
        navigation: "auto",
        validation: "default",
        progress: "auto",
        theme: "material",
        runtime: {
          progress: false
        },
        form: {
          class: ""
        },
        multiValueFieldTypes: ["checkboxlist", "tags"],
        ruleMethods: {
          "visible": [Field.show, Field.hide],
          "enabled": [Field.enable, Field.disable],
          "scope": [Page.scope, Page.descope],
          "customMethod": [Field.callCustomMethod, () => {}],
          "goto": [Page.goto, () => {}],
          "dialog": [Dialog.show, () => {}]
        }
      });

      const _ = this;

      Core.addEvents(this); // add simple event system
      // Use const factory = await ExoFormFactory.build() and factory.createForm()"

      if (!context || !(context instanceof ExoFormFactory.Context)) throw "Invalid instantiation of ExoForm: need ExoFormContext instance";
      _.context = context;
      opts = opts || {};
      const defOptions = {
        type: "form",
        customMethods: {}
      };
      _.options = { ...defOptions,
        ...opts
      }; //NOTE: this is not the loaded formSchema - see load() method.

      _.formSchema = { ..._.defaults
      }; // set defaults

      _.form = DOM.parseHTML(DOM.format(ExoForm.meta.templates[_.options.type], { ...(_.formSchema.form || {
          class: ""
        })
      }));
      _.container = DOM.parseHTML(ExoForm.meta.templates.exocontainer);
    }
    /**
     * load ExoForm schema 
     * @param {any} schema - A JSON ExoForm Schema object or a URL to fetch it from.
     * @return {Promise} - A Promise
     */


    load(schema) {
      const _ = this;

      return new Promise((resolve, reject) => {
        const loader = schema => {
          if (!schema) resolve(_);else {
            _.rawSchema = JSON.stringify(schema, null, 2); // keep original;

            _.formSchema = { ..._.defaults,
              ...schema
            };

            _.triggerEvent(ExoFormFactory.events.schemaLoaded);

            _.formSchema.totalFieldCount = _.getTotalFieldCount(_.formSchema);

            _._createComponents();

            _._applyLoadedSchema();

            resolve(_);
          }
        };

        let isSchema = typeof schema == "object";

        if (!isSchema) {
          try {
            schema = new URL(schema, this.formSchema.baseUrl);
            fetch(schema).then(x => x.json()).then(r => {
              loader(r);
            }).catch(ex => {
              reject(ex);
            });
          } catch (ex) {
            reject(ex);
          }
        } else {
          loader(schema);
        }
      });
    }

    _createComponents() {
      this.addins = {};

      for (var n in ExoFormFactory.meta) {
        let cmp = ExoFormFactory.meta[n];
        let tp = cmp.type.getType(this);
        this.addins[n] = new tp(this);
      }
    }

    _applyLoadedSchema() {
      const _ = this;

      _.formSchema.form = _.formSchema.form || {};
      let formClasses = _.formSchema.form.class ? _.formSchema.form.class.split(' ') : ["standard"];
      formClasses.forEach(c => {
        _.form.classList.add(c);
      });
    }

    triggerEvent(eventName, detail, ev) {
      console.debug("Triggering event", eventName, "detail: ", detail);

      if (!ev) {
        ev = new Event(eventName, {
          "bubbles": false,
          "cancelable": true
        });
      }

      ev.detail = {
        exoForm: this,
        ...(detail || {})
      };
      return this.dispatchEvent(ev);
    }

    getTotalFieldCount(schema) {
      let totalFieldCount = 0;
      if (!schema || !schema.pages || schema.pages.length === 0) return 0;
      schema.pages.forEach(p => {
        if (p && p.fields) totalFieldCount += p.fields.length;
      });
      return totalFieldCount;
    }

    isPageValid(index) {
      const _ = this;

      let hasInvalid = false;

      try {
        this.runValidCheck = true; // prevent reportValidity() showing messages on controls 

        hasInvalid = this.formSchema.pages[index - 1].fields.filter(f => {
          return !f._control.valid;
        }).length > 0;
      } finally {
        _.runValidCheck = false;
      }

      return !hasInvalid;
    }
    /**
     * Render ExoForm schema into a form
     * Returns a Promise
     */


    renderForm() {
      const _ = this;

      _.triggerEvent(ExoFormFactory.events.renderStart);

      _._cleanup();

      return new Promise((resolve, reject) => {
        if (!_.formSchema || !_.formSchema.pages || _.formSchema.pages.length == undefined) throw "Invalid ExoForm schema";

        _.container.appendChild(_.form);

        try {
          _._renderPages().then(() => {
            _._finalizeForm();

            resolve(_);
          }).catch(ex => {
            reject("_renderPages() failed: " + ex.toString());
          });
        } catch (ex) {
          reject("Exception in _renderPages(): " + ex.toString());
        }
      });
    }

    _finalizeForm() {
      const _ = this;

      console.debug("Finalizing form, rendering is ready");

      _.addins.navigation.render();

      _.addins.progress.render();

      _.addins.theme.apply();

      _.form.addEventListener("submit", e => {
        e.preventDefault(); // preventing default behaviour

        e.stopPropagation();

        _.submitForm(e);
      }); // stop propagating events to above form 
      // in case for is embedded in another one (such as ExoFormBuilder)


      _.form.addEventListener("change", e => {
        e.stopPropagation();
      });

      _._checkRules();

      _._updateView(0);

      _.triggerEvent(ExoFormFactory.events.renderReady); // Test for fom becoming user-interactive 


      var observer = new IntersectionObserver((entries, observer) => {
        if (_.container.offsetHeight) {
          console.debug("Form is now interactive");

          _.triggerEvent(ExoFormFactory.events.interactive);
        }
      }, {
        root: document.documentElement
      });
      observer.observe(_.container);
    }

    _cleanup() {
      this.addins.navigation.clear();
      if (this.container) this.container.innerHTML = "";
    }
    /**
    * Adds an event handler
    * @param {string} eventName - Name of the event to listen to - Use xo.form.factory.events as a reference
    * @param {function} func - function to attach 
    * @return {object} - The ExoForm instance
    */


    on(eventName, func) {
      console.debug("Listening to event", eventName, func);
      this.addEventListener(eventName, func);
      return this;
    }

    _renderPages() {
      const _ = this;

      return new Promise((resolve, reject) => {
        var pageNr = 0;

        _.form.setAttribute("data-current-page", pageNr + 1);

        let totalFieldsRendered = 0;
        _.pageContainer = DOM.parseHTML('<div class="exf-wrapper" />');

        _.formSchema.pages.forEach(p => {
          pageNr++;
          p = _._enrichPageSettings(p, pageNr);

          _.pageContainer.appendChild(p.dummy);

          _.createControl(p).then(page => {
            let pageFieldsRendered = 0;
            p.fields.forEach(f => {
              console.debug("Rendering field", f.name, f);
              f.dummy = DOM.parseHTML('<span/>');
              page.appendChild(f.dummy);

              _.createControl(f).then(() => {
                f._control.render().then(rendered => {
                  if (!rendered) throw ExoFormFactory.fieldToString(f) + " does not render an HTML element";
                  pageFieldsRendered = this._addRendered(f, rendered, pageFieldsRendered, p, page);
                }).catch(ex => {
                  let rendered = DOM.parseHTML(DOM.format('<span class="exf-error exf-render-error" title="{{title}}">ERROR</span>', {
                    title: "Error rendering field " + ExoFormFactory.fieldToString(f) + ": " + ex.toString()
                  }));
                  pageFieldsRendered = this._addRendered(f, rendered, pageFieldsRendered, p, page);
                }).finally(r => {
                  totalFieldsRendered++;

                  if (totalFieldsRendered === _.formSchema.totalFieldCount) {
                    _.container.classList.add(pageNr > 1 ? "exf-multi-page" : "exf-single-page"); // check for custom container


                    if (_.formSchema.form.container) {
                      let cf = _._getFormContainerProps(_);

                      _.createControl(cf).then(cx => {
                        cx.render().then(x => {
                          x.appendChild(_.pageContainer);
                          _.pageContainer = DOM.unwrap(_.pageContainer);
                          cx.finalize(_.pageContainer);

                          _.form.appendChild(x);

                          resolve();
                        });
                      });
                    } else {
                      _.form.appendChild(_.pageContainer);

                      resolve();
                    }
                  }
                });
              }).catch(ex => {
                reject("Exception in createControl() for control " + ExoFormFactory.fieldToString(f) + ": " + ex.toString());
              });
            });
          }).catch(ex => {
            reject("Exception in createControl() for page container " + ExoFormFactory.fieldToString(p) + ": " + ex.toString());
          });
        });
      });
    }

    _addRendered(f, rendered, pageFieldsRendered, p, page) {
      DOM.replace(f.dummy, rendered);
      delete f.dummy;
      pageFieldsRendered++;

      if (pageFieldsRendered === p.fields.length) {
        console.debug("Page " + p.pagenr + " rendered with " + pageFieldsRendered + " controls");
        page.render().then(pageElm => {
          DOM.replace(p.dummy, pageElm);
          delete p.dummy;
        });
      }

      return pageFieldsRendered;
    }

    _getFormContainerProps() {
      let p = {
        type: "div",
        class: "exf-wrapper",
        ...this.formSchema.form.container,
        ...{
          pages: this.formSchema.pages && this.formSchema.pages.length ? this.formSchema.pages.map(y => {
            return {
              id: "page" + y.id,
              caption: y.legend
            };
          }) : []
        }
      };
      return p;
    }

    _enrichPageSettings(p, pageNr) {
      p.index = pageNr;
      console.debug("Rendering page " + p.index);
      p.isPage = true;
      p.type = p.type || "fieldset";
      p.pagenr = pageNr;
      p.pageid = p.id || "page" + pageNr;
      p.class = "exf-cnt exf-page" + (p.class ? " " + p.class : "");
      p.dummy = DOM.parseHTML('<span/>');
      return p;
    }
    /**
     * query all fields using matcher and return matches
     * @param {function} matcher - function to use to filter
     * @return {array} - All matched fields in the current ExoForm schema
     */


    query(matcher) {
      if (matcher === undefined) matcher = () => {
        return true;
      };
      let matches = [];
      this.formSchema.pages.forEach(p => {
        let fieldIndex = 0;
        p.fields.forEach(f => {
          f._page = {
            index: p.index,
            legend: p.legend
          };
          f._index = fieldIndex;

          if (matcher(f)) {
            matches.push(f);
          }

          fieldIndex++;
        });
      });
      return matches;
    }
    /**
     * Get field with given name
     * @param {string} name - name of field to get
     * @return {Object} - Field
     */


    get(name) {
      let results = this.query(f => {
        return f.name === name;
      });
      return results.length ? results[0] : null;
    }
    /**
     * Map data to form, once schema is loaded
     * @param {function} mapper - a function that will return a value per field
     * @return {object} - the current ExoForm instance
     */


    map(mapper) {
      this.query().forEach(f => {
        let value = mapper(f);

        if (value !== undefined) {
          f.value = value;

          if (f.setCurrentValue) {
            f.setCurrentValue(f.value);
          } else if (f._control && f._control.htmlElement) {
            f._control.htmlElement.value = f.value || "";
          }
        }
      });
      return this;
    }
    /**
     * Submits the form
     * @param {event} ev - event object to pass onto the submit handler
     */


    submitForm(ev) {
      const _ = this;

      if (ev) ev.preventDefault();

      if (!_.addins.validation.checkValidity()) {
        console.debug("checkValidity - Form not valid");

        _.addins.validation.reportValidity();

        return;
      }

      ({
        target: _.form
      });

      _.getFormValues(ev).then(data => {
        _.triggerEvent(ExoFormFactory.events.post, {
          postData: data
        });
      });
    }
    /**
     * Gets the current form's values
     * @return {promise} - A promise with the typed data posted
     */


    getFormValues() {
      const _ = this;

      const data = {};
      return new Promise((resolve, reject) => {
        let formData = Object.fromEntries(new FormData(_.form));

        _.formSchema.pages.forEach(p => {
          p.fields.forEach(f => {
            if (f.getCurrentValue) {
              data[f.name] = f.getCurrentValue();
            } else {
              data[f.name] = formData[f.name];
              data[f.name] = ExoFormFactory.checkTypeConversion(f.type, data[f.name]);
            }
          });
        });

        console.debug("Form data to post", data);
        resolve(data);
      });
    }

    getFieldValue(f) {
      if (f && f.getCurrentValue) return f.getCurrentValue();else if (f.name) {
        return DOM.getValue(this.form.querySelector("[name='" + f.name + "']"));
      }
    }
    /**
     * Moves to the given page in a multi-page form.
     */


    gotoPage(page) {
      return this._updateView(0, page);
    }
    /**
     * Moves to the next page in a multi-page form.
     */


    nextPage() {
      this._updateView(+1);
    }
    /**
     * Moves to the previous page in a multi-page form.
     */


    previousPage() {
      this._updateView(-1);
    }

    _updateView(add, page) {
      const _ = this;

      let current = _.currentPage;

      if (add > 0 && current > 0) {
        if (!this.isPageValid(_.currentPage)) {
          this.addins.validation.reportValidity(_.currentPage);
          return;
        }
      }

      page = page || 1;
      if (add !== 0) page = parseInt(_.form.getAttribute("data-current-page") || "0");
      page = _._getNextPage(add, page);

      let pageCount = _.getLastPage();

      if (current > 0) {
        if (!_.addins.navigation.canMove(current, page)) return;

        let returnValue = _.triggerEvent(ExoFormFactory.events.beforePage, {
          from: current,
          page: page,
          pageCount: pageCount
        });

        if (returnValue === false) return;
      }

      _.form.setAttribute("data-current-page", page);

      _.form.setAttribute("data-page-count", _.formSchema.pages.length);

      _.currentPage = page;
      let i = 0;

      _.form.querySelectorAll('.exf-page[data-page]').forEach(p => {
        i++;
        p.classList[i === page ? "add" : "remove"]("active");
      });

      _.addins.navigation.update();

      _.triggerEvent(ExoFormFactory.events.page, {
        from: current,
        page: page,
        pageCount: pageCount
      });

      return page;
    }

    _getNextPage(add, page) {
      const _ = this;

      let ok = false;
      var skip;

      do {
        page += add;

        if (page > _.formSchema.pages.length) {
          return undefined;
        }

        let pgElm = _.form.querySelector('.exf-page[data-page="' + page + '"]');

        if (pgElm) {
          skip = pgElm.getAttribute("data-skip") === "true";
          console.debug("Wizard Page " + page + " currently " + (skip ? "OUT OF" : "in") + " scope");

          if (!skip) {
            ok = true;
          }
        } else {
          ok = true;
          return undefined;
        }

        if (add === 0) break;
      } while (!ok);

      if (page < 1) page = 1;
      return page;
    }

    getLastPage() {
      const _ = this;

      let pageNr = parseInt(_.form.getAttribute("data-current-page"));
      let lastPage = 0;
      let nextPage = -1;

      do {
        nextPage = _._getNextPage(+1, pageNr);

        if (nextPage) {
          lastPage = nextPage;
          pageNr = nextPage;
        }
      } while (nextPage);

      return lastPage || pageNr || 1;
    }
    /**
     * Renders a single ExoForm control 
     * @param {object} field - field structure sub-schema. 
     * @return {promise} - A promise with the typed rendered element
     */


    async renderSingleControl(field) {

      let c = await this.createControl(field);
      field._control = c;
      let element = await c.render();
      if (!element) throw ExoFormFactory.fieldToString(field) + " does not render an HTML element";
      return element;
    }

    createControl(f) {
      const _ = this;

      return new Promise((resolve, reject) => {
        const doResolve = (f, c) => {
          f._control = c; // keep field in element data

          c.htmlElement.data = c.htmlElement.data || {};
          c.htmlElement.data.field = f;
          c.htmlElement.setAttribute("data-exf", "1"); // mark as element holding data

          console.debug("Resolving ", ExoFormFactory.fieldToString(f));
          resolve(c);
        };

        try {
          if (!f || !f.type) throw "Incorrect field options. Must be object with at least 'type' property. " + JSON.stringify(f);
          f.id = f.id || _._generateUniqueElementId();

          let field = _.context.get(f.type);

          if (!field) throw f.type + " is not a registered ExoForm field type";
          let baseType = field.type;
          if (!baseType) throw "Class for " + f.type + " not defined";
          if (!_.context.isExoFormControl(f)) throw "Cannot create control: class for " + f.type + " is not derived from ExoControlBase";
          let control = null;
          let context = {
            exo: _,
            field: f
          };

          if (f.custom) {
            ExoFormFactory.loadCustomControl(f, f.custom).then(x => {
              let customType = x.default;
              control = new customType(context);
              doResolve(f, control);
            });
          } else {
            control = new baseType(context);
            doResolve(f, control);
          }
        } catch (ex) {
          //reject("Error in createControl(): " + ex.toString())
          let field = _.context.get("div");

          let control = new field.type({
            exo: _,
            field: { ...f
            }
          });
          control.htmlElement.appendChild(DOM.parseHTML(DOM.format('<span class="exf-error exf-create-error" title="{{title}}">ERROR</span>', {
            title: "Error creating " + ExoFormFactory.fieldToString(f) + ": " + ex.toString()
          })));
          doResolve(f, control);
        }
      });
    }

    _generateUniqueElementId() {
      let gid = Core.guid();
      gid = gid.split('-');
      gid = gid[gid.length - 1];
      return "exf" + gid;
    }

    testValidity(e, field) {
      if (this.runValidCheck) e.preventDefault();
    }

    _checkRules() {
      const _ = this;

      if (_.options.type !== "form") return;

      _.formSchema.pages.forEach(p => {
        if (Array.isArray(p.rules)) {
          console.debug("Checking page rules", p);
          p.rules.forEach(r => {
            if (Array.isArray(r.expression)) {
              _._interpretRule("page", p, r);
            }
          });
        }

        p.fields.forEach(f => {
          if (Array.isArray(f.rules)) {
            console.debug("Checking field rules", f);
            f.rules.forEach(r => {
              if (Array.isArray(r.expression)) {
                _._interpretRule("field", f, r);
              }
            });
          }
        });
      });
    }

    getRenderedControl(id) {
      return this.form.querySelector('[data-id="' + id + '"]');
    }

    getFieldFromElementId(id) {
      var e = this.getRenderedControl(id);
      return ExoFormFactory.getFieldFromElement(e);
    } // Interpret rules like "msg_about,change,value,!,''"


    _interpretRule(objType, f, rule) {
      const _ = this;

      let obj = ExoFormFactory.fieldToString(f);
      console.debug("Running rule on " + obj + " -> [", rule.expression.join(', ') + "]");

      if (rule.expression.length === 5) {
        let method = _.formSchema.ruleMethods[rule.type];

        if (method) {
          let dependencyField = _.getRenderedControl(rule.expression[0]);

          if (dependencyField) {
            let dependencyControl = dependencyField.querySelector("[name]");
            if (!dependencyControl) dependencyControl = dependencyField;

            if (!dependencyControl) {
              console.error("Dependency control for rule on '" + obj + "' not found");
            } else {
              console.debug("Dependency control for rule on '" + obj + "': ", dependencyControl.name);

              const func = e => {
                console.debug("Event '" + rule.expression[1] + "' fired on ", DOM.elementPath(e));
                let ruleArgs = rule.expression.slice(2, 5);

                let expressionMatched = _._testRule(f, dependencyControl, ...ruleArgs);

                console.debug("Rule", ruleArgs, "matched: ", expressionMatched);
                let index = expressionMatched ? 0 : 1;
                const rf = method[index];
                console.debug("Applying rule", rule.expression[1], obj);
                rf.apply(f._control.htmlElement, [{
                  event: e,
                  field: f,
                  exoForm: _,
                  rule: rule,
                  dependency: dependencyControl
                }]);

                let host = _._getEventHost(dependencyControl);

                _._setupEventEventListener({
                  field: f,
                  host: host,
                  rule: rule,
                  eventType: rule.expression[1],
                  method: func
                });
              };

              func({
                target: dependencyControl
              });
            }
          } else {
            console.warn("Dependency field for", f, "not found with id '" + rule.expression[0] + "'");
          }
        } else {
          console.error("Rule method for rule type", rule.type, "on field", f);
        }
      }
    }

    _setupEventEventListener(settings) {

      if (settings.eventType === "livechange") {
        settings.eventType = "input";
      }

      console.debug("Setting up event listener of type '" + settings.eventType + "' on ", DOM.elementToString(settings.host));
      settings.host.addEventListener(settings.eventType, settings.method);
    }

    _getEventHost(ctl) {
      let eh = ctl.closest('[data-evtarget="true"]');
      return eh || ctl;
    }

    _testRule(f, control, value, compare, rawValue) {
      var t = undefined;
      let v = this.getFieldValue(control);

      try {
        t = eval(rawValue);
      } catch (ex) {
        console.error("Error evaluating rule control value for ", control, compare, v, rawValue);
        throw "Error evaluating " + rawValue;
      }

      console.debug("Value of '" + control.name + "' =", v);
      return Core.compare(compare, v, t);
    }

    clear() {
      this.form.reset();
      this.form.querySelectorAll(".clearable").forEach(c => {
        c.innerHTML = "";
      });
    }

  }

  _defineProperty(ExoForm, "meta", {
    properties: {
      all: ["accept", "alt", "autocomplete", "autofocus", "capture", "checked", "dirName", "disabled", "height", "list", "max", "maxLength", "min", "minLength", "multiple", "name", "pattern", "placeholder", "readOnly", "required", "size", "src", "step", "type", "value", "width", "className"],
      map: {
        "class": "className",
        "readonly": "readOnly",
        "dirname": "dirName",
        "minlength": "minLength",
        "maxlength": "maxLength"
      },
      reserved: ["containerClass", "caption", "template", "elm", "ctl", "tagname"]
    },
    templates: {
      empty:
      /*html*/
      `<span data-replace="true"></span>`,
      exocontainer:
      /*html*/
      `<div class="exf-container"></div>`,
      //default: /*html*/`<div data-id="{{id}}" class="exf-ctl-cnt {{class}}"><label title="{{caption}}">{{caption}}</label><span data-replace="true"></span></div>`,
      //nolabel: /*html*/`<div data-id="{{id}}" class="exf-ctl-cnt {{class}}"><span data-replace="true"></span></div>`,
      //text: /*html*/`<div data-id="{{id}}" class="exf-ctl-cnt exf-base-text {{class}}"><span data-replace="true"></span><label title="{{caption}}">{{caption}}</label></div>`,
      //labelcontained: /*html*/`<div data-id="{{id}}" class="exf-ctl-cnt {{class}}"><label title="{{tooltip}}"><span data-replace="true"></span> <span>{{caption}}</span></label></div>`,
      form:
      /*html*/
      `<form class="exf-form {{class}}" method="post"></form>`,
      static:
      /*html*/
      `<div class="{{class}}" ></div>`,
      fieldset:
      /*html*/
      `<fieldset data-page="{{pagenr}}" data-pageid="{{pageid}}" class="exf-cnt {{class}}"></fieldset>`,
      legend:
      /*html*/
      `<legend class="exf-page-title">{{legend}}</legend>`,
      pageIntro:
      /*html*/
      `<p class="exf-page-intro">{{intro}}</p>`,
      datalist:
      /*html*/
      `<datalist id="{{id}}"></datalist>`,
      datalistItem:
      /*html*/
      `<option label="{{label}}" value="{{value}}" >`,
      button:
      /*html*/
      `<button name="{{name}}" type="{{type}}" class="btn {{class}}">{{caption}}</button>`
    }
  });

  _defineProperty(ExoForm, "_staticConstructor", (() => {
    ExoForm.setup();
  })());

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
      if (!obj || !obj.exoForm) throw "Invalid invocation of callCustomMethod";
      let method = obj.rule.method;

      if (method) {
        let f = obj.exoForm.options.customMethods[method];
        f.apply(obj.exoForm, [obj]);
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
      return obj.exoForm.gotoPage(obj.rule.page);
    }

  } //TODO


  class Dialog {
    static show(obj) {
      debugger;
    }

  }

  class ExoControlBase {
    constructor(context) {
      _defineProperty(this, "attributes", {});

      _defineProperty(this, "acceptedProperties", []);

      _defineProperty(this, "dataProps", {});

      _defineProperty(this, "containerTemplate", ExoForm.meta.templates.empty);

      if (this.constructor === ExoControlBase) throw new Error("Can't instantiate abstract class!");
      this.context = context;
      if (!context || !context.field || !context.exo) throw "Invalid instantiation of ExoControlBase";
      this.htmlElement = DOM.parseHTML('<span/>');
    }

    _getContainerTemplate(obj) {
      if (this.context.field.isPage) {
        return DOM.format(this.containerTemplate, this._getContainerAttributes());
      } else if (this.context.field.type === "button") {
        const tpl =
        /*html*/
        `<div data-id="{{id}}" class="exf-ctl-cnt {{class}"><span data-replace="true"></span></div>`;
        return DOM.format(tpl, this._getContainerAttributes());
      }

      return (
        /*html*/
        `<div data-id="${obj.id}" class="${obj.class}" data-field-type="${obj.type}">
    <div class="exf-ctl">
        <label for="${obj.id}" aria-hidden="true" class="exf-label" title="${obj.caption}">${obj.caption}</label>
        <span data-replace="true"></span>
    </div>
    <div class="exf-fld-details">
        <div class="exf-help-wrapper"></div>
    </div>
</div>`
      );
    }

    set htmlElement(el) {
      this._htmlElement = el;
      this.allowedAttributes = ExoFormFactory.listNativeProps(this.htmlElement);
      this.isSelfClosing = ["area", "base", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"].includes(el.tagName.toLowerCase());
    }

    get htmlElement() {
      return this._htmlElement;
    }

    appendChild(elm) {
      this.htmlElement.appendChild(elm);
    }

    triggerChange(detail) {
      var evt = document.createEvent("HTMLEvents");
      evt.initEvent("change", true, true);
      evt.detail = detail;
      this.htmlElement.dispatchEvent(evt);
    }

    set enabled(value) {
      let inp = this.htmlElement;
      inp.disabled = !value;
      let cnt = inp.closest(".exf-ctl-cnt");

      if (cnt) {
        cnt.classList[value ? "remove" : "add"]("disabled");
      }
    }
    /*
    * Tell system which properties to take from the configured field schema
    */


    acceptProperties(...ar) {
      ar.forEach(p => {
        if (typeof p === "string") {
          p = {
            name: p
          };
        }

        let prop = this.acceptedProperties.find(e => {
          return e.name === p.name;
        });

        if (!prop) {
          this.acceptedProperties.push(p);
          if (this.context.field[p.name] !== undefined) this[p.name] = this.context.field[p.name];
        }
      });
    }

    get enabled() {
      return !this.htmlElement.disabled;
    }

    _scope() {
      let f = this.context.field;
      return { ...f,
        caption: f.caption || "",
        tooltip: f.tooltip || "",
        class: "",
        id: f.id
      };
    }

    _addContainerClasses() {
      this.container.classList.add(...this._getContainerClasses());
    }

    _getContainerClasses() {
      let ar = ["exf-ctl-cnt"];
      ar.push("exf-base-" + this._getBaseType());

      if (this.context.field.containerClass) {
        let cc = this.context.field.containerClass.trim().split(" ");
        cc.forEach(c => {
          ar.push(c);
        });
      }

      if (this.htmlElement.tagName === "INPUT" || this.htmlElement.tagName === "TEXTAREA") ar.push("exf-input");
      if (this.context.field.readOnly) ar.push("exf-readonly");
      if (this.context.field.disabled) ar.push("exf-disabled");
      return ar;
    }

    _getBaseType() {
      let returns = this.context.field.returnValueType ? this.context.field.returnValueType.name : "String";
      if (this.isTextInput) return "text";
      if (returns === "Boolean") return "bool";
      if (returns === "Array") return "multi";
      return "default";
    }

    async render() {
      this.setProperties();

      for (var a in this.attributes) {
        if (a === "required") {
          this._htmlElement.required = this.attributes[a];
          continue;
        }

        this._htmlElement.setAttribute(a, this.attributes[a]);
      }

      for (var a in this.dataProps) {
        this._htmlElement.setAttribute("data-" + a, this.dataProps[a]);
      }

      this.container = DOM.parseHTML(this._getContainerTemplate(this._scope()));
      if (this.container.getAttribute("data-replace") === "true") this.container = this.htmlElement;else {
        let toReplace = this.container.querySelector('[data-replace="true"]');
        if (!toReplace) this.container = this.htmlElement;else DOM.replace(toReplace, this.htmlElement);
      }
      this.addEventListeners();

      if (this.context.field.required) {
        this.container.classList.add("exf-required");
      }

      this._addContainerClasses();

      return this.container;
    }

    addEventListeners() {
      const _ = this;

      const exo = _.context.exo;
      const f = _.context.field;

      _.htmlElement.addEventListener("invalid", e => {
        console.debug("check validity on ", e.target, "submitCheck", _.submitCheck);

        if (e.target.closest("[data-page]").getAttribute("data-skip") === "true") {
          console.debug("invalid event on skipped control", e.target.name);
          e.preventDefault();
          return false;
        } else return exo.testValidity(e, f);
      });

      _.htmlElement.addEventListener("change", e => {
        let isDirty = e.target.value != e.target.defaultValue;
        let el = e.target.closest(".exf-ctl-cnt");
        if (el) el.classList[isDirty ? "add" : "remove"]("exf-dirty");
      });
    }

    _getContainerAttributes() {
      let f = this.context.field;
      return { ...f,
        caption: f.caption || "",
        tooltip: f.tooltip || "",
        class: f.containerClass || "",
        //+ this.isTextInput ? " exf-base-text" : "" ,
        id: this.id + "-container"
      };
    }

    setProperties() {
      let f = this.context.field;

      for (var prop in f) {
        if (ExoForm.meta.properties.reserved.includes(prop)) continue;
        let value = f[prop.toLowerCase()];
        let useName = prop; // ExoForm.meta.properties.map[prop] || prop;

        if (this.allowedAttributes.includes(useName)) {
          this.attributes[useName] = value;
        } else {
          if (typeof value === "object") {
            this[useName] = value;
          } else {
            if (!this.acceptedProperties || !this.acceptedProperties.includes(useName)) {
              this.dataProps[useName] = value;
            }
          }
        }
      }
    } // returns valid state of the control - can be subclassed


    get valid() {
      let numInvalid = 0;
      this.container.querySelectorAll("*").forEach(el => {
        if (el.reportValidity) {
          try {
            if (!el.reportValidity()) {
              numInvalid++;
            }
          } catch {}
        }
      }); // let input = this.container.querySelector("[name]");
      // if (this.htmlElement && this.htmlElement.reportValidity)
      //     return this.htmlElement.reportValidity()
      // return true;

      return numInvalid === 0;
    }

    get validationMessage() {
      let msg = "";
      this.container.querySelectorAll("*").forEach(el => {
        if (el.validationMessage) {
          msg = el.validationMessage;
        }
      });
      return msg;
    }

    showValidationError() {
      if (this.htmlElement && this.htmlElement.reportValidity) return this.htmlElement.reportValidity();
      return true;
    }
    /**
     * Displays a help text to the user. Pass with empty @msg to hide.
     * @param {String} msg - The message to display
     * @param {Object} options - The options (type: "info|error|invalid")
     * @returns 
     */


    showHelp(msg, options) {
      if (!msg) {
        if (this._error != null) {
          this._error.parentNode.removeChild(this._error);

          this._error = null;
        }

        if (this.container) {
          this.container.removeAttribute('aria-invalid');
          this.container.classList.remove("exf-invalid");
        }

        return;
      }

      options = options || {
        type: "info"
      };

      if (this._error != null) {
        this._error.innerHTML = msg;
        return;
      }

      this._error = DOM.parseHTML(`<div class="exf-help exf-help-${options.type}">${msg}</div>`);

      if (options.type === "invalid") {
        this.container.setAttribute('aria-invalid', 'true');
        this.container.classList.add('exf-invalid');
      }

      this.container.querySelector(".exf-help-wrapper").appendChild(this._error);
    }

  }

  _defineProperty(ExoControlBase, "returnValueType", undefined);

  class ExoElementControl extends ExoControlBase {
    constructor(context) {
      super(context);

      _defineProperty(this, "containerTemplate", ExoForm.meta.templates.empty);

      if (context.field.tagName) {
        try {
          this.htmlElement = DOM.parseHTML('<' + context.field.tagName + '/>');

          if (this.htmlElement.nodeName !== context.field.tagName.toUpperCase()) {
            throw "'" + context.field.tagName + "' is not a valid tagName";
          }

          if (!this.isSelfClosing) {
            this.acceptProperties({
              name: "html",
              type: String,
              description: "Inner HTML"
            });
          }

          if (this.html) {
            this.htmlElement.innerHTML = this.html;
          }
        } catch (ex) {
          throw "Could not generate '" + context.field.tagName + "' element: " + ex.toString();
        }
      }
    }

  }

  _defineProperty(ExoElementControl, "returnValueType", undefined);

  class ExoLinkControl extends ExoElementControl {
    constructor(context) {
      super(context);
      this.htmlElement = document.createElement("a");
      this.acceptProperties({
        name: "external",
        type: Boolean,
        description: "External to open in new tab"
      }, {
        name: "html",
        type: String
      });
    }

    async render() {
      if (this.external) this.htmlElement.setAttribute("target", "_blank");
      return super.render();
    }

  }

  class ExoInputControl extends ExoElementControl {
    //containerTemplate = ExoForm.meta.templates.default;
    constructor(context) {
      super(context);
      this.htmlElement = document.createElement('input');

      if (context.field.type === "hidden") {
        this.containerTemplate = ExoForm.meta.templates.empty;
      }
    }

    async render() {
      var f = this.context.field;

      if (f.type === "email") {
        this.createEmailLookup();
      }

      await super.render();
      this.testDataList();

      switch (this.context.field.type) {
        case "color":
          this.container.classList.add("exf-std-lbl");
          break;
      }

      return this.container;
    }

    createEmailLookup() {
      const _ = this;

      _.htmlElement.addEventListener("keyup", e => {
        if (e.key !== "Enter") {
          console.log(e.key);
          let data = [];
          ["@gmail.com", "@outlook.com", "@live.nl", "@yahoo.com", "@hotmail.com"].forEach(a => {
            data.push(e.target.value.split('@')[0] + a);
          });

          if (data.length > 1) {
            _.createDataList(_.context.field, data);
          } else {
            _.destroyDataList();
          }
        } else {
          let dl = _.container.querySelector("datalist");

          if (dl) {
            dl.remove();
          }

          e.preventDefault();
        }
      });
    }

    destroyDataList() {
      let dl = this.container.querySelector("datalist");

      if (dl) {
        dl.remove();
      }
    }

    testDataList() {
      const _ = this;

      let f = _.context.field;

      if (f.lookup) {
        if (Array.isArray(f.lookup)) {
          _.createDataList(f, f.lookup);
        } else {
          let query = q => {
            // TODO: query REST 
            let url = f.lookup.replace(".json", "_" + q + ".json");
            url = new URL(url, _.formSchema.baseUrl);
            fetch(url).then(x => x.json()).then(data => {
              _.createDataList(f, data);
            });
          };

          if (!Core.isValidUrl(f.lookup)) {
            query = _.getFetchLookup(f);
          }

          this.htmlElement.addEventListener("keyup", e => {
            query(f._control.htmlElement.value);
          });
        }
      }
    }

    getFetchLookup(f) {
      const _ = this;

      const exo = _.context.exo;
      const o = {
        field: f,
        type: "lookup",
        data: f.lookup,
        callback: (field, data) => {
          _.createDataList.call(_, field, data);
        }
      };

      if (o.data.type === "OpenData") {
        // TODO enhance
        return q => {
          q = q.substr(0, 1).toUpperCase() + q.substr(1);
          let url = o.data.url + "?$top=20&$filter=substring(" + o.data.field + ",0," + q.length + ") eq '" + q + "'";
          fetch(url).then(x => x.json()).then(data => {
            if (data && data.value) {
              o.callback(o.field, data.value.map(e => {
                return e.Title;
              }));
            }
          });
        };
      }

      return exo.options.get(o);
    }

    createDataList(f, data) {

      let id = f.id;

      f._control.htmlElement.setAttribute("list", "list-" + id);

      let dl = f._control.container.querySelector("datalist");

      if (dl) dl.remove();
      const dataList = DOM.parseHTML(DOM.format(ExoForm.meta.templates.datalist, {
        id: "list-" + id
      }));
      data.forEach(el => {
        let o = {
          value: el,
          label: el.name,
          ...el
        };
        dataList.appendChild(DOM.parseHTML(DOM.format(ExoForm.meta.templates.datalistItem, o)));
      });

      f._control.container.appendChild(dataList);
    }

  }

  _defineProperty(ExoInputControl, "returnValueType", String);

  class ExoTextControl extends ExoInputControl {
    // "exocontainer, default, nolabel, text, group, form, page, navigation, datalist, datalistItem, button"
    constructor(context) {
      super(context);

      _defineProperty(this, "containerTemplate", ExoForm.meta.templates.text);

      this.isTextInput = true;
      this.htmlElement = DOM.parseHTML('<input type="text"/>');
    }

    async render() {
      var f = this.context.field;
      if (!this.attributes.placeholder) this.attributes.placeholder = " "; // forces caption into text input until focus

      await super.render();

      if (f.mask) {
        DOM.maskInput(this.htmlElement, {
          mask: f.mask,
          format: f.format
        });
      }

      return this.container;
    }

  }

  class ExoFormControl extends ExoElementControl {
    constructor(context) {
      super(context);
      this.htmlElement = DOM.parseHTML('<form />');
    }

  }

  class ExoDivControl extends ExoElementControl {
    constructor(context) {
      super(context);

      _defineProperty(this, "html", "");

      this.htmlElement = document.createElement('div');
      this.acceptProperties({
        name: "html",
        type: String,
        description: "Inner HTML of the div"
      });
    }

    async render() {
      if (this.html) {
        this.htmlElement.innerHTML = this.html;
      }

      return await super.render();
    }

  }

  class ExoTextAreaControl extends ExoTextControl {
    //containerTemplate = ExoForm.meta.templates.text;
    constructor(context) {
      super(context);

      _defineProperty(this, "autogrow", false);

      this.acceptProperties({
        name: "autogrow",
        type: Boolean,
        description: "Use to automatically expand the typing area as you add lines"
      });
      this.htmlElement = DOM.parseHTML('<textarea/>');
    }

    setProperties() {
      super.setProperties();

      if (this.attributes["value"]) {
        this.htmlElement.innerHTML = this.attributes["value"];
        delete this.attributes["value"];
      }
    }

    async render() {
      await super.render();

      if (this.autogrow) {
        this.htmlElement.setAttribute("onInput", "this.parentNode.dataset.replicatedValue = this.value");
        this.htmlElement.parentNode.classList.add("autogrow");
      }

      return this.container;
    }

  }

  class ExoListControl extends ExoElementControl {
    constructor(context) {
      super(context);

      _defineProperty(this, "containerTemplate", ExoForm.meta.templates.default);

      _defineProperty(this, "isMultiSelect", false);

      _defineProperty(this, "view", "block");

      this.htmlElement = DOM.parseHTML('<select></select>');
      this.acceptProperties({
        name: "view",
        type: String,
        description: "Set the view mode (list, tiles)"
      });
    }

    async populateList(containerElm, tpl) {
      const _ = this;

      const f = _.context.field;

      if (f.items && Array.isArray(f.items)) {
        let index = 0;
        f.items.forEach(i => {
          _.addListItem(f, i, tpl, containerElm, index);

          index++;
        });
      }
    }

    addListItem(f, i, tpl, container, index) {
      const _ = this;

      var dummy = DOM.parseHTML('<span/>');
      container.appendChild(dummy);
      let item = { ...i,
        name: i.name || i,
        value: i.value !== undefined ? i.value : i,
        type: _.optionType,
        inputname: f.name,
        checked: i.checked ? "checked" : "",
        tooltip: (i.tooltip || i.name || "").replace('{{field}}', ''),
        oid: f.id + "_" + index
      };
      var o = {
        field: f,
        control: _,
        item: item
      };

      if (item.element) {
        o.listElement = item.element;
        DOM.replace(dummy, item.element);
      } else if (item.field) {
        // replace item.name with rendered ExoForm control
        this.renderFieldSync(item, tpl, container);
      } else if (item.html) {
        o.listElement = DOM.parseHTML(item.html);
        DOM.replace(dummy, o.listElement);
      } else {
        var s = DOM.format(tpl, item);
        o.listElement = DOM.parseHTML(s);
        DOM.replace(dummy, o.listElement);
      }

      _.context.exo.triggerEvent(ExoFormFactory.events.getListItem, o);
    } // use trick to run async stuff and wait for it.


    renderFieldSync(item, tpl, container) {
      return (async (item, tpl) => {
        if (item.name.indexOf('{{field}}') === -1) {
          item.tooltip = item.tooltip || item.name;
          item.name = item.name + '{{field}}';
        }

        const exoContext = this.context.exo.context;
        let e = await exoContext.createForm().renderSingleControl(item.field);
        item.name = DOM.format(item.name, {
          field: e.outerHTML
        });
        container.appendChild(DOM.parseHTML(DOM.format(tpl, item)));
      })(item, tpl); //So we defined and immediately called this async function.
    }

    async render() {
      let elm = await super.render();

      switch (this.view) {
        case "tiles":
          elm.classList.add("tiles");
          break;

        case "list":
          elm.classList.add("block");
          break;
      }

      return elm;
    }

  }

  class ExoDropdownListControl extends ExoListControl {
    constructor(context) {
      super(context);
      this.htmlElement = DOM.parseHTML(
      /*html*/
      `<select size="1"></select>`);
    }

    async render() {
      this.context.field;
      const tpl =
      /*html*/
      `<option class="{{class}}" value="{{value}}">{{name}}</option>`;
      await this.populateList(this.htmlElement, tpl);
      let elm = super.render();
      this.container.classList.add("exf-input-group");
      return elm;
    }

  }

  class ExoInputListControl extends ExoListControl {
    constructor(context) {
      super(context);
      const tpl = `<div data-evtarget="true" class="{{class}}" {{required}}>{{inner}}</div>`;
      this.htmlElement = DOM.parseHTML(DOM.format(tpl, {
        class: [this.context.field.class || ""].join(' ')
      }));
    }

    async render() {
      this.context.field;
      const tpl =
      /*html*/
      `<div class="exf-ilc-cnt" title="{{tooltip}}">
            <input class="{{class}}" {{checked}} name="{{inputname}}" value="{{value}}" type="{{type}}" id="{{oid}}" />
            <label for="{{oid}}" class="exf-caption">
                <div class="exf-caption-main">{{name}}</div>
                <div title="{{description}}" class="exf-caption-description">{{description}}</div>
            </label>
        </div>`;
      await this.populateList(this.htmlElement, tpl);
      super.render();
      this.container.classList.add("exf-input-group");
      return this.container;
    }

    get valid() {
      if (this.context.field.required) {
        let numChecked = this.container.querySelectorAll("input:checked").length;

        if (numChecked === 0) {
          let inp = this.container.querySelector("input");

          try {
            inp.setCustomValidity(this.getValidationMessage());
            inp.reportValidity();
          } catch {}
          return false;
        }
      }

      return true;
    } // Used to get localized standard validation message 


    getValidationMessage() {
      let msg = "You must select a value",
          testFrm = DOM.parseHTML('<form><input name="test" required /></form');
      testFrm.querySelector("input").addEventListener("invalid", e => {
        msg = e.validationMessage;
        e.preventDefault();
      });
      testFrm.submit();
      return msg;
    }

    showValidationError() {
      this.htmlElement.querySelector("input").setCustomValidity('This cannot be empty');
    }

    get validationMessage() {
      return this.htmlElement.querySelector("input").validationMessage;
    }

  }

  class ExoRadioButtonListControl extends ExoInputListControl {
    constructor(context) {
      super(context);

      _defineProperty(this, "optionType", "radio");
    }

  }

  class ExoCheckboxListControl extends ExoInputListControl {
    //isMultiSelect = true;
    constructor(context) {
      super(context);

      _defineProperty(this, "optionType", "checkbox");
    }

    async render() {
      const _ = this;

      await super.render();

      _.context.field.getCurrentValue = () => {
        // fix checkboxlist ->  Object.fromEntries returns single value
        let ar = [];
        this.container.querySelectorAll(":checked").forEach(i => {
          ar.push(i.value);
        });
        return ar;
      };

      return this.container;
    }

  }

  _defineProperty(ExoCheckboxListControl, "returnValueType", Array);

  class ExoButtonControl extends ExoElementControl {
    constructor(context) {
      super(context);
      this.iconHtml = "";
      this.htmlElement = DOM.parseHTML('<button class="exf-btn" />');
      this.acceptProperties({
        name: "icon",
        description: "Icon class to be used (using a span)"
      }, {
        name: "click",
        description: "Click method"
      }, {
        name: "action",
        description: `Possible values: 
                    - 'next' (next page in Wizard)
                    - 'reset' (back to first page)
                    - 'goto:[page]' (jump to given page)
                `
      });
    }

    async render() {
      const _ = this;

      await super.render();

      if (_.icon) {
        _.htmlElement.appendChild(DOM.parseHTML('<span class="' + _.icon + '"></span>'));

        this.htmlElement.appendChild(document.createTextNode(' '));
      }

      _.htmlElement.appendChild(DOM.parseHTML(`<span class="exf-caption">${this.context.field.caption}</span>`));

      await super.render();

      _.htmlElement.addEventListener("click", e => {
        if (_.click) {
          _.context.exo.getFormValues().then(data => {
            let f = _.click;

            if (typeof f !== "function") {
              f = _.context.exo.options.customMethods[f];
            }

            if (typeof f !== "function") {
              if (_.context.exo.options.host) {
                if (typeof _.context.exo.options.host[_.click] === "function") {
                  f = _.context.exo.options.host[_.click];
                  f.apply(_.context.exo.options.host, [data, e]);
                  return;
                }
              } else {
                throw "Not a valid function: " + _.click;
              }
            }

            f.apply(_, [data, e]);
          });
        } else if (_.action) {
          let actionParts = _.action.split(":");

          switch (actionParts[0]) {
            case "next":
              _.context.exo.nextPage();

              break;

            case "reset":
              _.context.exo.nextPage();

              break;

            case "goto":
              _.context.exo.gotoPage(parseInt(actionParts[1]));

              break;
          }
        }
      });

      this.container.classList.add("exf-btn-cnt");
      this.htmlElement.classList.add("exf-btn");
      return this.container;
    }

    set icon(value) {
      this._icon = value;
    }

    get icon() {
      return this._icon;
    }

  }

  class ExoNumberControl extends ExoInputControl {
    constructor(context) {
      super(context);

      _defineProperty(this, "buttons", false);

      this.context.field.type = "number";
      this.acceptProperties({
        name: "buttons",
        description: "Add plus and minus buttons",
        type: Boolean
      });
    }

    async render() {
      await super.render();

      if (this.buttons) {
        this.minusButton = document.createElement("button");
        this.minusButton.innerText = "-";
        this.minusButton.classList.add("nmbr-m");
        this.plusButton = document.createElement("button");
        this.plusButton.innerText = "+";
        this.plusButton.classList.add("nmbr-p");
        this.htmlElement.parentNode.insertBefore(this.minusButton, this.htmlElement);
        this.htmlElement.parentNode.insertBefore(this.plusButton, this.htmlElement.nextSibling);
        this.container.classList.add("exf-nmbr-btns");
        this.container.classList.add("exf-std-lbl");
        this.container.addEventListener("click", e => {
          e.cancelBubble = true;
          e.preventDefault();

          if (e.target === this.plusButton) {
            if (this.htmlElement.max === "" || parseInt(this.htmlElement.value) < parseInt(this.htmlElement.max)) {
              this.htmlElement.value = parseInt("0" + (this.htmlElement.value || (this.htmlElement.min != "" ? this.htmlElement.min - 1 : -1))) + 1;
            }
          } else if (e.target === this.minusButton) {
            if (this.htmlElement.min === "" || parseInt(this.htmlElement.value) > parseInt(this.htmlElement.min)) {
              this.htmlElement.value = parseInt("0" + (this.htmlElement.value || (this.htmlElement.max != "" ? this.htmlElement.max - 1 : 1))) - 1;
            }
          }

          this.triggerChange();
        });
      }

      return this.container;
    }

  }

  _defineProperty(ExoNumberControl, "returnValueType", Number);

  class ExoRangeControl extends ExoNumberControl {
    constructor(context) {
      super(context);

      _defineProperty(this, "showoutput", false);

      this.context.field.type = "range";
      this.acceptProperties({
        name: "showoutput",
        type: Boolean
      });
    }

    async render() {
      const me = this;
      await super.render();

      if (this.showoutput) {
        this.output = document.createElement("output");

        const sync = e => {
          me.output.value = me.htmlElement.value;
        };

        this.htmlElement.parentNode.insertBefore(this.output, this.htmlElement.nextSibling);
        this.htmlElement.addEventListener("input", sync);
        sync();
        this.container.classList.add("exf-rng-output");
      } // force outside label rendering


      this.container.classList.add("exf-std-lbl");
      return this.container;
    }

  }

  _defineProperty(ExoRangeControl, "returnValueType", Number);

  class ExoProgressControl extends ExoElementControl {
    //containerTemplate = ExoForm.meta.templates.nolabel;
    constructor(context) {
      super(context);
      this.htmlElement = DOM.parseHTML('<progress />');
    }

  }

  class ExoFormPageControl extends ExoDivControl {
    finalize() {}

  }

  class ExoFieldSetControl extends ExoFormPageControl {
    constructor(context) {
      super(context);
      this.htmlElement = DOM.parseHTML(DOM.format(ExoForm.meta.templates.fieldset, context.field));

      if (context.field.legend) {
        this.appendChild(DOM.parseHTML(DOM.format(ExoForm.meta.templates.legend, {
          legend: context.field.legend
        })));
      }

      if (context.field.intro) {
        this.appendChild(DOM.parseHTML(DOM.format(ExoForm.meta.templates.pageIntro, {
          intro: context.field.intro
        })));
      }
    }

  } //#endregion


  class ExoBaseControls {}

  _defineProperty(ExoBaseControls, "controls", {
    base: {
      hidden: true,
      type: ExoControlBase
    },
    element: {
      type: ExoElementControl,
      note: "Any raw HTML Element",
      demo: {
        type: "element",
        tagName: "img",
        src: "https://source.unsplash.com/random/600x400"
      }
    },
    input: {
      hidden: true,
      type: ExoInputControl
    },
    div: {
      hidden: true,
      type: ExoDivControl,
      note: "A standard HTML div container element",
      demo: {
        html: `<h3>Wow!</h3>`
      }
    },
    form: {
      hidden: true,
      type: ExoFormControl
    },
    formpage: {
      hidden: true,
      type: ExoFormPageControl
    },
    fieldset: {
      hidden: true,
      for: "page",
      type: ExoFieldSetControl,
      note: "A fieldset for grouping controls in a form"
    },
    text: {
      caption: "Short text",
      type: ExoTextControl,
      note: "Standard text input"
    },
    url: {
      caption: "Website Address/URL",
      base: "text",
      note: "A text input that will accept URLs only"
    },
    tel: {
      caption: "Phone number",
      base: "input",
      note: "A text input that is used to input phone numbers",
      demo: {
        value: "06 23467899"
      }
    },
    number: {
      caption: "Numeric Control",
      type: ExoNumberControl,
      note: "A text input that is used to input phone numbers",
      demo: {
        min: 1,
        max: 99
      }
    },
    range: {
      caption: "Range Slider",
      type: ExoRangeControl,
      note: "A range slider input",
      demo: {
        min: 1,
        max: 10,
        value: 5
      }
    },
    color: {
      caption: "Color Input",
      base: "input",
      note: "A control to select a color",
      demo: {
        value: "#cc4433"
      }
    },
    checkbox: {
      base: "input",
      note: "A checkbox",
      demo: {
        checked: true
      }
    },
    email: {
      caption: "Email Address",
      base: "text",
      note: "A text input that validates email addresses",
      demo: {
        required: true
      }
    },
    date: {
      base: "input",
      note: "A date input that is used to input phone numbers"
    },
    month: {
      base: "input",
      note: "A month selector input"
    },
    "datetime-local": {
      caption: "Local Date &amp; Time selector",
      base: "input",
      note: "A date input that is used to input local date/time"
    },
    search: {
      base: "text",
      note: "A search text input with a clear button"
    },
    password: {
      base: "text",
      note: "A text input for password masking"
    },
    file: {
      caption: "File upload",
      base: "text",
      note: "A standard file upload control"
    },
    multiline: {
      caption: "Long text",
      type: ExoTextAreaControl,
      alias: "textarea",
      note: "A multi-line text input"
    },
    list: {
      hidden: true,
      type: ExoListControl
    },
    dropdown: {
      type: ExoDropdownListControl,
      alias: "select",
      note: "A dropdown list control",
      demo: {
        items: ["First", "Second"]
      }
    },
    checkboxlist: {
      caption: "Multiselect List (checkbox)",
      type: ExoCheckboxListControl,
      note: "A group of checkboxes to select multiple items",
      demo: {
        items: ["First", "Second"]
      }
    },
    radiobuttonlist: {
      caption: "Single select List (radio)",
      type: ExoRadioButtonListControl,
      note: "A group of radio buttons to select a single value from",
      demo: {
        items: ["First", "Second"]
      }
    },
    hidden: {
      base: "input",
      note: "A hidden input that is used to store variables"
    },
    custom: {
      hidden: true,
      base: "div",
      note: "A custom control that is used to render your own ExoFormControl classes"
    },
    button: {
      type: ExoButtonControl,
      note: "A button control",
      demo: {
        caption: "Click me"
      }
    },
    time: {
      caption: "Time selector",
      base: "text",
      note: "A time input control"
    },
    progressbar: {
      type: ExoProgressControl,
      alias: "progress",
      note: "A progress indicator control"
    },
    link: {
      type: ExoLinkControl,
      note: "HTML Anchor element"
    }
  });

  class ExoFileDropControl extends ExoBaseControls.controls.input.type {
    constructor(context) {
      super(context);

      _defineProperty(this, "height", 120);

      this.acceptProperties({
        name: "maxSize"
      }, {
        name: "max",
        type: Number,
        description: "Max number of files accepted"
      }, {
        name: "fileTypes",
        type: String | Array,
        description: 'Array of strings - example: ["image/"]'
      }, {
        name: "maxSize",
        type: Number,
        description: "Maximum filesize of files to be uploaded (in bytes) - example: 4096000"
      }, {
        name: "height",
        type: Number,
        description: "Height of drop area"
      });
    }

    async render() {
      const _ = this;

      _.field = _.context.field;
      _.field.type = "file";
      _.field.data = this.field.data || [];
      await super.render();
      _.previewDiv = DOM.parseHTML(`<div class="file-preview clearable"></div>`);
      _.previewDiv.style.height = `${this.height}px`;

      _.container.querySelector(".exf-ctl").appendChild(_.previewDiv);

      _.container.classList.add("exf-filedrop");

      _.bind(data => {
        if (!data.error) {
          var thumb = DOM.parseHTML('<div data-id="' + data.fileName + '" class="thumb ' + data.type.replace('/', ' ') + '"></div>');
          let close = DOM.parseHTML('<button title="Remove" type="button" class="close">x</button>');
          close.addEventListener("click", e => {
            let thumb = e.target.closest(".thumb");
            let id = thumb.getAttribute("data-id");
            Array.from(_.previewDiv.children).indexOf(thumb);
            thumb.remove();
            _.field.data = _.field.data.filter(item => item.fileName !== id);

            _._change();
          });
          thumb.appendChild(close);
          thumb.setAttribute("title", data.fileName);
          let img = DOM.parseHTML('<div class="thumb-data"></div>');

          if (data.type.startsWith("image/")) {
            thumb.classList.add("image");
            img.style.backgroundImage = 'url("' + _.getDataUrl(data.b64, data.type) + '")';
          } else {
            thumb.classList.add("no-img");
          }

          thumb.appendChild(img);
          thumb.appendChild(DOM.parseHTML('<figcaption>' + data.fileName + '</figcaption>'));

          _.previewDiv.appendChild(thumb);
        } else {
          _.showHelp(data.error, {
            type: "error"
          });
        }
      });

      _.field.getCurrentValue = () => {
        return _.field.data.sort();
      };

      return _.container;
    }

    _change() {
      const _ = this;

      DOM.trigger(this.htmlElement, "change", {
        data: _.context.field.data
      });
    }

    bind(cb) {
      const _ = this;

      const loadFile = data => {
        var file = data.file;

        _.showHelp();

        var reader = new FileReader();

        reader.onload = function () {
          let returnValue = {
            error: "",
            fileName: data.file.name,
            type: data.file.type,
            size: data.file.size,
            date: data.file.lastModifiedDate
          };

          if (_.field.max) {
            if (_.field.data.length >= _.field.max) {
              returnValue.error = "Maximum number of attachements reached";
            }
          }

          if (_.field.fileTypes) {
            let found = false;

            _.field.fileTypes.forEach(t => {
              if (data.file.type.indexOf(t) === 0) found = true;
            });

            if (!found) {
              returnValue.error = "Invalid file type";
            }
          }

          if (!returnValue.error && _.field.maxSize) {
            if (data.file.size > _.field.maxSize) {
              returnValue.error = "Max size exceeded";
            }
          }

          if (!returnValue.error) {
            returnValue.b64 = btoa(reader.result);
          }

          if (!returnValue.error) {
            _.field.data.push(returnValue);

            _._change();
          }

          cb(returnValue);
        };

        try {
          reader.readAsBinaryString(file);
        } catch {}
      };

      const dropArea = _.htmlElement.closest(".exf-ctl-cnt");

      const uf = e => {
        if (!e.detail) {
          e.stopImmediatePropagation();
          e.cancelBubble = true;
          e.preventDefault();
          e.stopPropagation();
          e.returnValue = false;
          dropArea.classList.remove("drag-over");

          for (var i in e.target.files) {
            loadFile({
              file: e.target.files[i]
            });
          }

          return false;
        }
      };

      _.htmlElement.addEventListener("change", uf);

      dropArea.addEventListener('dragover', e => {
        e.dataTransfer.dropEffect = 'copy';
        dropArea.classList.add("drag-over");
      });
      dropArea.addEventListener('drop', e => {
        e.dataTransfer.dropEffect = 'none';
        dropArea.classList.remove("drag-over");
      });
      dropArea.addEventListener('dragleave', e => {
        e.dataTransfer.dropEffect = 'none';
        dropArea.classList.remove("drag-over");
      });
    }

    getDataUrl(b64, fileType) {
      return "data:" + fileType + ";base64," + b64;
    }

    get valid() {
      return this.htmlElement, checkValidity();
    } // // Used to get localized standard validation message 
    // getValidationMessage() {
    //     let msg = "";
    //     return msg;
    // }


  }

  class ExoCKRichEditor extends ExoBaseControls.controls.div.type {
    constructor(context) {
      super(context);
      this.htmlElement.data = {};
    }

    async render() {
      const _ = this;

      await super.render();
      _.htmlElement;
      return new Promise((resolve, reject) => {
        DOM.require("https://cdn.ckeditor.com/ckeditor5/17.0.0/classic/ckeditor.js", () => {
          ClassicEditor.create(_.htmlElement).catch(error => {
            console.error(error);
          }).then(ck => {
            _.htmlElement.data["editor"] = ck;

            _.context.field.getCurrentValue = () => {
              return _.htmlElement.data.editor.getData();
            };

            _.context.field.setCurrentValue = v => {
              _.htmlElement.data.editor.setData(v);
            };
          });
          resolve(_.container);
        });
      });
    }

  }

  class ExoSwitchControl extends ExoBaseControls.controls.range.type {
    constructor(...args) {
      super(...args);

      _defineProperty(this, "containerTemplate", ExoForm.meta.templates.labelcontained);
    }

    setProperties() {
      this.context.field.min = 0;
      this.context.field.max = 1;
      this.context.field.value = this.context.field.value || 0;
      super.setProperties();
      this.context.field.type = "switch";
    }

    async render() {
      const _ = this;

      let e = await super.render();
      this.container.classList.add("exf-switch"); // force outside label rendering

      this.container.classList.add("exf-std-lbl");

      const check = e => {
        let sw = e.target.closest(".exf-switch");
        let range = sw.querySelector("[type='range']");
        sw.classList[range.value === "1" ? "add" : "remove"]("on"); //DOM.trigger(range, "change")

        _.triggerChange();
      };

      check({
        target: e
      });
      if (this.context.field.disabled) this.enabled = false;
      e.addEventListener("click", e => {
        e.stopImmediatePropagation();
        e.cancelBubble = true;
        e.preventDefault();
        e.stopPropagation();
        e.returnValue = false;
        let range = e.target.closest(".exf-switch").querySelector("[type='range']");

        if (e.target.tagName != "INPUT") {
          range.value = range.value == "0" ? 1 : 0;
          check({
            target: range
          });
        }

        check({
          target: range
        });
      });
      return this.container; //return e;
    }

  }

  _defineProperty(ExoSwitchControl, "returnValueType", Boolean);

  class ExoTaggingControl extends ExoBaseControls.controls.text.type {
    // Initialize elements
    constructor(context) {
      super(context);

      _defineProperty(this, "max", null);

      _defineProperty(this, "duplicate", false);

      _defineProperty(this, "wrapperClass", 'exf-tags-input');

      _defineProperty(this, "tagClass", 'tag');

      _defineProperty(this, "arr", []);

      this.acceptProperties({
        name: "max",
        type: Number,
        description: "Maximum number of tags allowed"
      }, {
        name: "duplicate",
        type: Boolean,
        description: "Allow duplicates. Default false"
      }, {
        name: "tags",
        description: "Tag names to set (array)"
      });
    }

    async render() {
      const _ = this;

      await super.render();
      _.wrapper = document.createElement('div');
      _.input = document.createElement('input');

      _.htmlElement.setAttribute('type', 'hidden');

      _.htmlElement.addEventListener("change", e => {
        if (!e.detail) {
          e.stopImmediatePropagation();
          e.cancelBubble = true;
          e.preventDefault();
          e.stopPropagation();
          e.returnValue = false;
        }
      });

      _.wrapper.append(_.input);

      _.wrapper.classList.add(_.wrapperClass);

      _.htmlElement.parentNode.insertBefore(_.wrapper, _.htmlElement);

      _.context.field.getCurrentValue = () => {
        return _.arr;
      };

      _.wrapper.addEventListener('click', function () {
        _.input.focus();
      });

      _.input.addEventListener('keydown', e => {
        var str = _.input.value.trim();

        if (!!~[9, 13, 188].indexOf(e.keyCode)) {
          e.preventDefault();
          e.stopPropagation();
          e.returnValue = false;
          _.input.value = "";

          if (str !== "") {
            _.addTag(str);
          }
        } else if (e.key === 'Backspace') {
          if (_.input.value === "") {
            let tags = _.wrapper.querySelectorAll(".tag");

            if (tags.length) {
              let i = tags.length - 1;

              _.deleteTag(tags[i], i);
            }
          }
        }
      });

      if (_.tags) {
        _.tags.forEach(t => {
          _.addTag(t);
        });
      }

      _.container.classList.add("exf-std-lbl");

      return _.container;
    } // Add Tag


    addTag(string) {
      const _ = this;

      if (_.anyErrors(string)) return;

      _.arr.push(string);

      var tag = document.createElement('span');
      tag.className = this.tagClass;
      tag.textContent = string;
      var closeIcon = document.createElement('a');
      closeIcon.innerHTML = '&times;';
      closeIcon.addEventListener('click', event => {
        event.preventDefault();
        var tag = event.target.parentNode;

        for (var i = 0; i < _.wrapper.childNodes.length; i++) {
          if (_.wrapper.childNodes[i] == tag) _.deleteTag(tag, i);
        }
      });
      tag.appendChild(closeIcon);

      _.wrapper.insertBefore(tag, _.input);

      _.triggerChange();

      return _;
    } // Delete Tag


    deleteTag(tag, i) {
      tag.remove();
      this.arr.splice(i, 1);
      this.triggerChange();
      return this;
    } // override ExoControlBase.triggerChange - dispatch event on htmlElement fails 
    // for some reason - disspatching on visual tag input


    triggerChange() {
      var evt = document.createEvent("HTMLEvents");
      evt.initEvent("change", true, true);
      evt.detail = {
        field: "tags"
      };
      this.input.dispatchEvent(evt);
    } // Errors


    anyErrors(string) {
      if (this.max != null && this.arr.length >= this.max) {
        return true;
      }

      if (!this.duplicate && this.arr.indexOf(string) != -1) {
        return true;
      }

      return false;
    }

    addData(array) {
      var plugin = this;
      array.forEach(function (string) {
        plugin.addTag(string);
      });
      return this;
    }

  }

  class ExoCaptchaControl extends ExoBaseControls.controls.div.type {
    constructor(context) {
      super(context);

      DOM.require("https://www.google.com/recaptcha/api.js");

      this.acceptProperties({
        name: "sitekey",
        type: String,
        description: "Key for Google reCaptcha",
        more: "https://developers.google.com/recaptcha/intro"
      }, {
        name: "invisible",
        type: Boolean,
        description: "Use invisible Captcha method",
        more: "https://developers.google.com/recaptcha/docs/invisible"
      });
    }

    async render() {
      this.htmlElement.classList.add("g-recaptcha");
      this.htmlElement.setAttribute("data-sitekey", this.sitekey);

      if (this.invisible) {
        this.htmlElement.setAttribute("data-size", "invisible");
      }

      return this.htmlElement;
    }

    set sitekey(value) {
      this._sitekey = value;
    }

    get sitekey() {
      return this._sitekey;
    }

    get invisible() {
      return this._invisible === true;
    }

    set invisible(value) {
      this._invisible = value == true;
    }

  } // TODO finish


  class DropDownButton extends ExoBaseControls.controls.list.type {
    constructor(context) {
      super(context);

      _defineProperty(this, "navTemplate",
      /*html*/
      `
        <nav class="ul-drop" role='navigation'>
            <ul>
                <li>
                    <a class="user-icon" href="#"><span class="ti-user"></span></a>
                    <ul></ul>
                </li>
            </ul>
        </nav>`);

      this.context.field.type = "hidden";
      this.htmlElement = DOM.parseHTML(this.navTemplate);
    }

    async render() {
      this.context.field;
      const tpl =
      /*html*/
      `<li title="{{tooltip}}"><a class="{{class}}" href="{{value}}">{{name}}</a></li>`;
      await this.populateList(this.htmlElement.querySelector("ul > li > ul"), tpl);
      return await super.render();
    }

    setupButton() {

      document.querySelector("body").classList.add("signed-out");
      container.appendChild(DOM.parseHTML(DOM.format(tpl, data, {
        empty: undefined
      })));
    }

  }

  class ExoEmbedControl extends ExoBaseControls.controls.element.type {
    constructor(context) {
      super(context);

      _defineProperty(this, "containerTemplate", ExoForm.meta.templates.default);

      _defineProperty(this, "width", 600);

      _defineProperty(this, "height", 400);

      this.acceptProperties({
        name: "url",
        description: "Url of the page to embed"
      }, {
        name: "width"
      }, {
        name: "height"
      });
      this.htmlElement = document.createElement("iframe");
    }

    async render() {
      this.htmlElement.setAttribute("src", this.url);
      this.htmlElement.setAttribute("frameborder", "0");
      this.htmlElement.setAttribute("allowfullscreen", "true");
      this.htmlElement.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
      await super.render();
      let wrapper = document.createElement("div");
      wrapper.classList.add("exf-embed-container");
      wrapper.appendChild(this.htmlElement);
      this.container.querySelector(".exf-ctl").appendChild(wrapper);
      this.container.classList.add("exf-base-embed");
      return this.container;
    }

  }

  class ExoVideoControl extends ExoEmbedControl {
    constructor(context) {
      super(context);

      _defineProperty(this, "mute", false);

      _defineProperty(this, "autoplay", true);

      _defineProperty(this, "player", "youtube");

      _defineProperty(this, "code", "abcdefghij");

      this.acceptProperties({
        name: "code",
        description: "Code of the video to embed"
      }, {
        name: "width"
      }, {
        name: "height"
      }, {
        name: "autoplay",
        type: Boolean,
        description: "Boolean indicating whether the video should immediately start playing"
      }, {
        name: "mute",
        type: Boolean,
        description: "Boolean indicating whether the video should be muted"
      }, {
        name: "player",
        type: String,
        description: "Player type. Currently implemented: youtube, vimeo"
      });
    }

    async render() {
      const player = ExoVideoControl.players[this.player];
      this.url = DOM.format(player.url, this);
      await super.render();
      return this.container;
    }

  }

  _defineProperty(ExoVideoControl, "players", {
    youtube: {
      url: "https://www.youtube.com/embed/{{code}}?autoplay={{autoplay}}&mute={{mute}}"
    },
    vimeo: {
      url: "https://player.vimeo.com/video/{{code}}?title=0&byline=0&portrait=0&background={{mute}}"
    }
  });

  class MultiInputControl extends ExoBaseControls.controls.div.type {
    //grid = "exf-cols-50-50";
    constructor(context) {
      super(context);

      _defineProperty(this, "containerTemplate", ExoForm.meta.templates.default);

      _defineProperty(this, "columns", "");

      _defineProperty(this, "areas", "");

      _defineProperty(this, "gap", "1rem");

      this.acceptProperties({
        name: "grid-template",
        description: "CSS3 grid template",
        more: "https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template"
      }, {
        name: "areas",
        description: "Grid template areas to set up on the containing div",
        example: `"field1 field1 field2"
                "field3 field4 field4"`
      }, {
        name: "columns",
        description: "Grid columns to set up on containing div",
        example: "10em 10em 1fr"
      }, {
        name: "gap",
        description: "Grid gap to set up on containing div",
        example: "16px"
      }, {
        name: "fields",
        type: Object,
        description: "Fields structure",
        example: {
          first: {
            caption: "First",
            type: "text",
            maxlength: 30
          },
          last: {
            caption: "Last",
            type: "text",
            maxlength: 50
          }
        }
      });
    }

    async render() {
      await super.render();

      const _ = this;

      const f = _.context.field;
      const exo = _.context.exo;
      this.htmlElement.classList.add("exf-cnt", "exf-ctl-group");

      if (this.areas && this.columns || this["grid-template"] || this.grid) {
        this.htmlElement.classList.add("grid");
      }

      if (this.areas && this.columns) {
        this.htmlElement.setAttribute("style", `display: grid; grid-template-areas: ${this.areas}; grid-template-columns: ${this.columns}; grid-gap: ${this.gap}`);
      } else {
        if (this["grid-template"]) {
          this.htmlElement.setAttribute("style", `display: grid; grid-template: ${this["grid-template"]}`);
        } else if (this.grid) {
          this.htmlElement.classList.add(this.grid);
        }
      }

      _._qs = name => {
        return this.htmlElement.querySelector('[data-multi-name="' + f.name + "_" + name + '"]');
      };

      const rs = async (name, options) => {
        return _.context.exo.renderSingleControl(options);
      };

      _.inputs = {};

      const add = async (n, options) => {
        options = { ...options,
          name: f.name + "_" + n
        };

        for (var o in options) {
          var v = options[o];
          if (v === "inherit") options[o] = f[o];
        }

        _.inputs[n] = await rs(n, options);

        _.inputs[n].setAttribute("data-multi-name", options.name);

        _.htmlElement.appendChild(_.inputs[n]);

        return _.inputs[n];
      };

      if (!this.fields && f.fields) {
        this.fields = f.fields;
      }

      for (var n in this.fields) {
        var elm = await add(n, this.fields[n]);
        if (this.areas) elm.setAttribute("style", `grid-area: ${n}`);
      }

      _._gc = e => {
        let data = {};

        for (var n in _.fields) {
          var elm = _._qs(n);

          let fld = ExoFormFactory.getFieldFromElement(elm);
          data[n] = exo.getFieldValue(fld);
        }

        return data;
      }; // custom setter


      _._sc = data => {
        for (var n in _.fields) {
          var elm = _._qs(n);

          let fld = ExoFormFactory.getFieldFromElement(elm);
          if (fld.setCurrentValue) fld.setCurrentValue(data[n]);else {
            elm.querySelector("[name]").value = data[n];
          }
        }
      };

      this.context.field.getCurrentValue = _._gc;
      this.context.field.setCurrentValue = _._sc;
      return this.container;
    }

    get valid() {
      let v = true;

      for (var n in this.fields) {
        var elm = this._qs(n);

        let fld = ExoFormFactory.getFieldFromElement(elm);

        if (!fld._control.valid) {
          v = false;
        }
      }

      return v;
    }

    showValidationError() {
      for (var n in this.fields) {
        var elm = this.getFormElement(this._qs(n));
        console.log("Checking ", elm);

        if (!elm.checkValidity()) {
          console.log("Not valid: ", elm);
          if (elm.reportValidity) elm.reportValidity();
          return false;
        }
      }

      return true;
    }

    getFormElement(elm) {
      if (elm.name && elm.form) return elm;
      return elm.querySelector("[name]") || elm;
    }

  }

  _defineProperty(MultiInputControl, "returnValueType", Object);

  class ExoNameControl extends MultiInputControl {
    constructor(...args) {
      super(...args);

      _defineProperty(this, "columns", "10em 1fr");

      _defineProperty(this, "areas", `"first last"`);

      _defineProperty(this, "fields", {
        first: {
          caption: "First",
          type: "text",
          maxlength: 30,
          required: "inherit"
        },
        last: {
          caption: "Last",
          type: "text",
          maxlength: 50,
          required: "inherit"
        }
      });
    }

  }

  class ExoNLAddressControl extends MultiInputControl {
    constructor(...args) {
      super(...args);

      _defineProperty(this, "columns", "4em 4em 10em 1fr");

      _defineProperty(this, "areas", `
        "code code nr fill"
        "ext ext city city"
        "street street street street"`);

      _defineProperty(this, "fields", {
        code: {
          caption: "Postcode",
          type: "text",
          size: 7,
          maxlength: 7,
          required: "inherit",
          pattern: "[1-9][0-9]{3}\s?[a-zA-Z]{2}",
          placeholder: "1234AB"
        },
        nr: {
          caption: "Huisnummer",
          type: "number",
          size: 6,
          maxlength: 6,
          required: "inherit",
          placeholder: "67"
        },
        ext: {
          caption: "Toevoeging",
          type: "text",
          size: 3,
          maxlength: 3,
          placeholder: "F"
        },
        city: {
          caption: "Plaats",
          type: "text",
          maxlength: 50,
          readonly: true,
          placeholder: "Den Helder"
        },
        street: {
          caption: "Straatnaam",
          type: "text",
          maxlength: 50,
          readonly: true,
          placeholder: "Dorpstraat"
        }
      });
    }

    async render() {
      const _ = this;

      let element = await super.render();

      const check = () => {
        var data = _._gc();

        if (data.code && data.nr) {
          fetch(DOM.format(ExoNLAddressControl.APIUrl, {
            nr: data.nr,
            code: data.code
          }), {
            referer: "https://stasfpwawesteu.z6.web.core.windows.net/",
            method: "GET"
          }).then(x => x.json()).then(j => {
            var r = j.response;

            if (r.numFound > 0) {
              let d = r.docs[0];
              _._qs("street").querySelector("[name]").value = d.straatnaam_verkort;

              _._qs("street").classList.add("exf-filled");

              _._qs("city").querySelector("[name]").value = d.woonplaatsnaam;

              _._qs("city").classList.add("exf-filled");
            }
          });
        }
      };

      _.inputs["nr"].addEventListener("change", check);

      _.inputs["code"].addEventListener("change", check);

      _.inputs["ext"].addEventListener("change", check);

      return element;
    }

  }

  _defineProperty(ExoNLAddressControl, "APIUrl", "https://geodata.nationaalgeoregister.nl/locatieserver/v3/free?q=postcode:{{code}}&huisnummer:{{nr}}");

  class ExoCreditCardControl extends MultiInputControl {
    constructor(...args) {
      super(...args);

      _defineProperty(this, "columns", "4em 4em 4em 1fr");

      _defineProperty(this, "areas", `
        "name name number number"
        "expiry expiry cvv fill"`);

      _defineProperty(this, "fields", {
        name: {
          caption: "Name on Card",
          type: "text",
          maxlength: 50,
          required: "inherit",
          placeholder: ""
        },
        number: {
          caption: "Credit Card Number",
          type: "text",
          size: 16,
          required: "inherit",
          maxlength: 16,
          placeholder: "",
          pattern: "[0-9]{13,16}"
        },
        expiry: {
          caption: "Card Expires",
          containerClass: "exf-label-sup",
          type: "month",
          required: "inherit",
          maxlength: 3,
          placeholder: "",
          min: new Date().getFullYear() + "-" + ('0' + (new Date().getMonth() + 1)).slice(-2)
        },
        cvv: {
          caption: "CVV",
          type: "number",
          required: "inherit",
          minlength: 3,
          maxlength: 3,
          size: 3,
          placeholder: "",
          min: "000"
        }
      });
    }

  }

  class ExoDateRangeControl extends MultiInputControl {
    constructor(...args) {
      super(...args);

      _defineProperty(this, "grid", "exf-cols-10em-10em");

      _defineProperty(this, "fields", {
        from: {
          caption: "From",
          type: "date"
        },
        to: {
          caption: "To",
          type: "date"
        }
      });
    }

    async render() {
      const _ = this;

      let element = await super.render();

      let _from = _.inputs.from.querySelector("[name]");

      let _to = _.inputs.to.querySelector("[name]");

      const check = e => {
        if (e.target === _from) {
          _to.setAttribute("min", _from.value);
        } else if (e.target === _to) {
          _from.setAttribute("max", _to.value);
        }
      };

      _from.addEventListener("change", check);

      _to.addEventListener("change", check);

      return element;
    }

  }

  class ExoDialogControl extends ExoBaseControls.controls.div.type {
    constructor(context) {
      super(context);

      _defineProperty(this, "title", "Dialog");

      _defineProperty(this, "confirmText", "OK");

      _defineProperty(this, "cancelText", "Cancel");

      _defineProperty(this, "cancelVisible", false);

      _defineProperty(this, "body", "The dialog body");

      _defineProperty(this, "modal", false);

      _defineProperty(this, "dlgTemplate",
      /*html*/
      `<div class="exf-dlg" role="dialog" id="{{dlgId}}">
<div class="exf-dlg-c">
    <div class="exf-dlg-h">
        <div class="exf-dlg-t">{{title}}<button type="button" class="dlg-bc dlg-x dismiss" ><span>&times;</span></button></div>
    </div>
<div class="exf-dlg-b">{{body}}</div>
<div class="exf-dlg-f">
    <button type="button" class="dlg-x btn exf-btn btn-default dismiss" >{{cancelText}}</button>
    <button type="button" class="dlg-x btn exf-btn btn-primary confirm" >{{confirmText}}</button>
</div>
</div>
</div>`);

      this.acceptProperties("title", "cancelText", "body", "confirmText", "cancelVisible", "modal");
      this.dlgId = 'dlg_' + Core.guid().replace('-', '');
    }

    hide(button, e) {
      if (this.context.field.click) {
        this.context.field.click.apply(this, [button, e]);
      }
    }

    show() {
      const _ = this;

      let html = DOM.format(_.dlgTemplate, { ...this
      });
      let dlg = DOM.parseHTML(html);
      dlg.classList.add(this.cancelVisible ? "dlg-cv" : "dlg-ch");

      const c = (e, confirm) => {
        //window.location.hash = "na";
        var btn = "cancel",
            b = e.target;

        if (confirm || b.classList.contains("confirm")) {
          btn = "confirm";
        }

        _.hide.apply(_, [btn, e]);

        if (!e.cancelBubble) {
          _.remove();
        }
      };

      dlg.querySelector(".dlg-x").addEventListener("click", c);
      document.body.appendChild(dlg);
      dlg.addEventListener("click", c);
      document.body.addEventListener("keydown", e => {
        if (e.keyCode === 27) c(e);
        if (e.keyCode === 13) c(e, true);
      }, {
        once: true
      });
      if (!this.modal) setTimeout(() => {
        document.body.addEventListener("click", c, {
          once: true
        });
      }, 10);
    }

    remove() {
      let dlg = document.querySelector("#" + this.dlgId);
      if (dlg) dlg.remove();
    }

  }

  class ExoInfoControl extends ExoBaseControls.controls.div.type {
    constructor(context) {
      super(context);

      _defineProperty(this, "template", `<section class="exf-info {{class}}">
    <div class="exf-info-title"><span class="exf-info-icon {{icon}}"></span><span class="exf-info-title-text">{{title}}</span></div>
    <div class="exf-info-body">{{body}}</div>
    </section>`);

      _defineProperty(this, "title", "");

      _defineProperty(this, "body", "");

      _defineProperty(this, "icon", "ti-info");

      this.acceptProperties("title", "icon", "body", "class");
    }

    async render() {
      const _ = this;

      DOM.format(_.template, { ...this
      });

      _.htmlElement.appendChild(DOM.parseHTML(DOM.format(_.template, this)));

      return _.htmlElement;
    }

  }

  class ExoStarRatingControl extends ExoBaseControls.controls.range.type {
    constructor(...args) {
      super(...args);

      _defineProperty(this, "svg",
      /*html*/
      `<svg>
    <defs>
      <path id="star" d="M48.856,22.73c0.983-0.958,1.33-2.364,0.906-3.671c-0.425-1.307-1.532-2.24-2.892-2.438l-12.092-1.757c-0.515-0.075-0.96-0.398-1.19-0.865L28.182,3.043c-0.607-1.231-1.839-1.996-3.212-1.996c-1.372,0-2.604,0.765-3.211,1.996L16.352,14c-0.23,0.467-0.676,0.79-1.191,0.865L3.069,16.622c-1.359,0.197-2.467,1.131-2.892,2.438c-0.424,1.307-0.077,2.713,0.906,3.671l8.749,8.528c0.373,0.364,0.544,0.888,0.456,1.4L8.224,44.701c-0.183,1.06,0.095,2.091,0.781,2.904c1.066,1.267,2.927,1.653,4.415,0.871l10.814-5.686c0.452-0.237,1.021-0.235,1.472,0l10.815,5.686c0.526,0.277,1.087,0.417,1.666,0.417c1.057,0,2.059-0.47,2.748-1.288c0.687-0.813,0.964-1.846,0.781-2.904l-2.065-12.042c-0.088-0.513,0.083-1.036,0.456-1.4L48.856,22.73z"></path>
      <clipPath id="stars">
        <use xlink:href="#star" x="0"></use>
        <use xlink:href="#star" x="50"></use>
        <use xlink:href="#star" x="100"></use>
        <use xlink:href="#star" x="150"></use>
        <use xlink:href="#star" x="200"></use>
      </clipPath>
    </defs>
  </svg>
  <!-- for safari-->
  <svg>
    <clipPath id="allStars">
      <path d="M24.97,0.047 C26.343,0.047 27.575,0.812 28.182,2.043 L28.182,2.043 L33.588,12.999 C33.818,13.466 34.263,13.789 34.778,13.864 L34.778,13.864 L46.87,15.621 C48.23,15.819 49.337,16.752 49.762,18.059 C50.186,19.366 49.839,20.772 48.856,21.73 L48.856,21.73 L40.107,30.259 C39.734,30.623 39.563,31.146 39.651,31.659 L39.651,31.659 L41.716,43.701 C41.899,44.759 41.622,45.792 40.935,46.605 C40.246,47.423 39.244,47.893 38.187,47.893 C37.608,47.893 37.047,47.753 36.521,47.476 L36.521,47.476 L25.706,41.79 C25.255,41.555 24.686,41.553 24.234,41.79 L24.234,41.79 L13.42,47.476 C11.932,48.258 10.071,47.872 9.005,46.605 C8.319,45.792 8.041,44.761 8.224,43.701 L8.224,43.701 L10.288,31.659 C10.376,31.147 10.205,30.623 9.832,30.259 L9.832,30.259 L1.083,21.731 C0.1,20.773 -0.247,19.367 0.177,18.06 C0.602,16.753 1.71,15.819 3.069,15.622 L3.069,15.622 L15.161,13.865 C15.676,13.79 16.122,13.467 16.352,13 L16.352,13 L21.759,2.043 C22.366,0.812 23.598,0.047 24.97,0.047 Z M124.97,0.047 C126.343,0.047 127.575,0.812 128.182,2.043 L128.182,2.043 L133.588,12.999 C133.818,13.466 134.263,13.789 134.778,13.864 L134.778,13.864 L146.87,15.621 C148.23,15.819 149.337,16.752 149.762,18.059 C150.186,19.366 149.839,20.772 148.856,21.73 L148.856,21.73 L140.107,30.259 C139.734,30.623 139.563,31.146 139.651,31.659 L139.651,31.659 L141.716,43.701 C141.899,44.759 141.622,45.792 140.935,46.605 C140.246,47.423 139.244,47.893 138.187,47.893 C137.608,47.893 137.047,47.753 136.521,47.476 L136.521,47.476 L125.706,41.79 C125.255,41.555 124.686,41.553 124.234,41.79 L124.234,41.79 L113.42,47.476 C111.932,48.258 110.071,47.872 109.005,46.605 C108.319,45.792 108.041,44.761 108.224,43.701 L108.224,43.701 L110.288,31.659 C110.376,31.147 110.205,30.623 109.832,30.259 L109.832,30.259 L101.083,21.731 C100.1,20.773 99.753,19.367 100.177,18.06 C100.602,16.753 101.71,15.819 103.069,15.622 L103.069,15.622 L115.161,13.865 C115.676,13.79 116.122,13.467 116.352,13 L116.352,13 L121.759,2.043 C122.366,0.812 123.598,0.047 124.97,0.047 Z M174.97,0.047 C176.343,0.047 177.575,0.812 178.182,2.043 L178.182,2.043 L183.588,12.999 C183.818,13.466 184.263,13.789 184.778,13.864 L184.778,13.864 L196.87,15.621 C198.23,15.819 199.337,16.752 199.762,18.059 C200.186,19.366 199.839,20.772 198.856,21.73 L198.856,21.73 L190.107,30.259 C189.734,30.623 189.563,31.146 189.651,31.659 L189.651,31.659 L191.716,43.701 C191.899,44.759 191.622,45.792 190.935,46.605 C190.246,47.423 189.244,47.893 188.187,47.893 C187.608,47.893 187.047,47.753 186.521,47.476 L186.521,47.476 L175.706,41.79 C175.255,41.555 174.686,41.553 174.234,41.79 L174.234,41.79 L163.42,47.476 C161.932,48.258 160.071,47.872 159.005,46.605 C158.319,45.792 158.041,44.761 158.224,43.701 L158.224,43.701 L160.288,31.659 C160.376,31.147 160.205,30.623 159.832,30.259 L159.832,30.259 L151.083,21.731 C150.1,20.773 149.753,19.367 150.177,18.06 C150.602,16.753 151.71,15.819 153.069,15.622 L153.069,15.622 L165.161,13.865 C165.676,13.79 166.122,13.467 166.352,13 L166.352,13 L171.759,2.043 C172.366,0.812 173.598,0.047 174.97,0.047 Z M224.97,0.047 C226.343,0.047 227.575,0.812 228.182,2.043 L228.182,2.043 L233.588,12.999 C233.818,13.466 234.263,13.789 234.778,13.864 L234.778,13.864 L246.87,15.621 C248.23,15.819 249.337,16.752 249.762,18.059 C250.186,19.366 249.839,20.772 248.856,21.73 L248.856,21.73 L240.107,30.259 C239.734,30.623 239.563,31.146 239.651,31.659 L239.651,31.659 L241.716,43.701 C241.899,44.759 241.622,45.792 240.935,46.605 C240.246,47.423 239.244,47.893 238.187,47.893 C237.608,47.893 237.047,47.753 236.521,47.476 L236.521,47.476 L225.706,41.79 C225.255,41.555 224.686,41.553 224.234,41.79 L224.234,41.79 L213.42,47.476 C211.932,48.258 210.071,47.872 209.005,46.605 C208.319,45.792 208.041,44.761 208.224,43.701 L208.224,43.701 L210.288,31.659 C210.376,31.147 210.205,30.623 209.832,30.259 L209.832,30.259 L201.083,21.731 C200.1,20.773 199.753,19.367 200.177,18.06 C200.602,16.753 201.71,15.819 203.069,15.622 L203.069,15.622 L215.161,13.865 C215.676,13.79 216.122,13.467 216.352,13 L216.352,13 L221.759,2.043 C222.366,0.812 223.598,0.047 224.97,0.047 Z M74.97,0.047 C76.343,0.047 77.575,0.812 78.182,2.043 L78.182,2.043 L83.588,12.999 C83.818,13.466 84.263,13.789 84.778,13.864 L84.778,13.864 L96.87,15.621 C98.23,15.819 99.337,16.752 99.762,18.059 C100.186,19.366 99.839,20.772 98.856,21.73 L98.856,21.73 L90.107,30.259 C89.734,30.623 89.563,31.146 89.651,31.659 L89.651,31.659 L91.716,43.701 C91.899,44.759 91.622,45.792 90.935,46.605 C90.246,47.423 89.244,47.893 88.187,47.893 C87.608,47.893 87.047,47.753 86.521,47.476 L86.521,47.476 L75.706,41.79 C75.255,41.555 74.686,41.553 74.234,41.79 L74.234,41.79 L63.42,47.476 C61.932,48.258 60.071,47.872 59.005,46.605 C58.319,45.792 58.041,44.761 58.224,43.701 L58.224,43.701 L60.288,31.659 C60.376,31.147 60.205,30.623 59.832,30.259 L59.832,30.259 L51.083,21.731 C50.1,20.773 49.753,19.367 50.177,18.06 C50.602,16.753 51.71,15.819 53.069,15.622 L53.069,15.622 L65.161,13.865 C65.676,13.79 66.122,13.467 66.352,13 L66.352,13 L71.759,2.043 C72.366,0.812 73.598,0.047 74.97,0.047 Z"></path>
    </clipPath>
  </svg>`);
    }

    async render() {
      let e = await super.render();
      let wrapper = document.createElement('div');
      e.appendChild(wrapper);
      let input = e.querySelector("[type=range]");
      input.setAttribute("min", "0");
      input.setAttribute("max", "5");
      input.setAttribute("step", "any");
      wrapper.appendChild(input);
      e.insertBefore(DOM.parseHTML(this.svg), wrapper);
      e.classList.add("exf-star-rating-cnt");
      wrapper.classList.add("exf-star-rating");
      throw "Not implemented";
    }

  }

  _defineProperty(ExoStarRatingControl, "returnValueType", Number);

  class ExoExtendedControls {}

  _defineProperty(ExoExtendedControls, "controls", {
    filedrop: {
      type: ExoFileDropControl,
      alias: "file",
      note: "An input for file uploading",
      demo: {
        max: 1,
        "fileTypes": ["image/"],
        maxSize: 4096000,
        caption: "Select your profile image",
        containerClass: "image-upload"
      }
    },
    switch: {
      type: ExoSwitchControl
    },
    richtext: {
      type: ExoCKRichEditor,
      note: "A CKEditor wrapper for ExoForm"
    },
    tags: {
      caption: "Tags control",
      type: ExoTaggingControl,
      note: "A control for adding multiple tags",
      demo: {
        tags: ["JavaScript", "CSS", "HTML"]
      }
    },
    multiinput: {
      type: MultiInputControl
    },
    creditcard: {
      caption: "Credit Card",
      type: ExoCreditCardControl,
      note: "A credit card control"
    },
    name: {
      caption: "Name (first, last) group",
      type: ExoNameControl,
      note: "Person name control"
    },
    nladdress: {
      caption: "Dutch address",
      type: ExoNLAddressControl,
      note: "Nederlands adres"
    },
    //tabstrip: { for: "page", type: ExoTabStripControl, note: "A tabstrip control for grouping controls in a form" },
    daterange: {
      caption: "Date range",
      type: ExoDateRangeControl,
      note: "A date range control"
    },
    embed: {
      type: ExoEmbedControl,
      note: "Embed anything in an IFrame",
      demo: {
        url: "https://codepen.io/chriscoyier/embed/gfdDu"
      }
    },
    video: {
      type: ExoVideoControl,
      caption: "Embed video",
      note: "An embedded video from YouTube or Vimeo",
      demo: {
        player: "youtube",
        code: "85Nyi4Xb9PY"
      }
    },
    dropdownbutton: {
      hidden: true,
      type: DropDownButton,
      note: "A dropdown menu button"
    },
    captcha: {
      caption: "Google ReCaptcha Control",
      type: ExoCaptchaControl,
      note: "Captcha field",
      demo: {
        sitekey: "6Lel4Z4UAAAAAOa8LO1Q9mqKRUiMYl_00o5mXJrR"
      }
    },
    starrating: {
      type: ExoStarRatingControl,
      note: "An accessible star rating control",
      demo: {
        value: 2.5
      }
    },
    dialog: {
      type: ExoDialogControl,
      caption: "Dialog",
      note: "A simple dialog (modal or modeless)"
    },
    info: {
      type: ExoInfoControl,
      note: "An info panel",
      demo: {
        title: "Info",
        icon: "ti-info",
        body: "Your informational text"
      }
    }
  });

  class ExoAceCodeEditor extends ExoBaseControls.controls.div.type {
    constructor(context) {
      super(context);

      _defineProperty(this, "mode", "html");

      _defineProperty(this, "theme", "chrome");

      this.htmlElement.data = {};
      this.acceptProperties({
        name: "mode",
        type: String,
        description: "Ace Editor mode - refer to Ace documentation"
      }, {
        name: "theme",
        type: String,
        description: "Ace Editor theme - refer to Ace documentation"
      });

      if (document.querySelector("html").classList.contains("theme-dark")) {
        this.theme = "ambiance";
      }
    }

    async render() {
      const _ = this;

      await super.render();

      _.context.field.getCurrentValue = () => {
        return _.htmlElement.data.editor.getValue();
      };

      _.context.field.setCurrentValue = value => {
        _.htmlElement.data.editor.setValue(value, -1);
      };

      return new Promise((resolve, reject) => {
        DOM.require("https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ace.js", () => {
          ace.config.set("fontSize", "14px");
          var editor = ace.edit(_.htmlElement);
          editor.setTheme("ace/theme/" + _.theme);
          editor.session.setMode("ace/mode/" + _.mode);
          _.htmlElement.style = "min-height: 200px; width: 100%";

          if (typeof _.value === "string" && _.value.length) {
            editor.setValue(_.value, -1);
          }

          _.htmlElement.setAttribute('data-evtarget', "true"); // set div as event target 


          editor.on("change", e => {
            setTimeout(() => {
              DOM.trigger(_.htmlElement, "change", {
                target: _.htmlElement
              });
            }, 10);
          });
          _.htmlElement.data["editor"] = editor;

          if (_.htmlElement.classList.contains("full-height")) {
            _.container.classList.add("full-height");

            let cc = _.container.querySelector(".exf-ctl");

            if (cc) cc.classList.add("full-height");
          }

          resolve(_.container);
        });
      });
    }

    setProperties() {
      if (this.context.field.mode) {
        this.mode = this.context.field.mode;
        delete this.context.field.mode;
      }

      if (this.context.field.theme) {
        this.theme = this.context.field.theme;
        delete this.context.field.theme;
      }

      if (this.context.field.value) {
        this.value = this.context.field.value;
        delete this.context.field.value;
      }

      super.setProperties();
    }

  }

  _defineProperty(ExoAceCodeEditor, "returnValueType", String);

  class ExoDevControls {}

  _defineProperty(ExoDevControls, "controls", {
    aceeditor: {
      type: ExoAceCodeEditor,
      note: "Ace code editor",
      demo: {
        mode: "html"
      }
    }
  });

  class ExoCircularChart extends ExoBaseControls.controls.div.type {
    constructor(context) {
      super(context);

      _defineProperty(this, "value", "0");

      _defineProperty(this, "size", "200");

      _defineProperty(this, "color", "#00acc1");

      this.acceptProperties({
        name: "value",
        type: Number,
        description: "Percentual value of the chart (0-100)"
      }, {
        name: "size"
      }, {
        name: "color"
      }, {
        name: "backgroundColor"
      }, {
        name: "textColor"
      }, {
        name: "subLineColor"
      }, {
        name: "caption"
      });
    }

    async render() {
      const _ = this;

      const me = _.htmlElement;
      let elm = await super.render();
      const tpl =
      /*html*/
      `<svg class="circle-chart" viewbox="0 0 33.83098862 33.83098862" width="{{size}}" height="{{size}}" xmlns="http://www.w3.org/2000/svg">
            <circle class="circle-chart__background" stroke="{{backgroundColor}}" stroke-width="2" fill="none" cx="16.91549431" cy="16.91549431" r="15.91549431" />
            <circle class="circle-chart__circle" stroke="{{color}}" stroke-width="2" stroke-dasharray="{{value}},100" stroke-linecap="round" fill="none" cx="16.91549431" cy="16.91549431" r="15.91549431" />
            <g class="circle-chart__info">
              <text class="metric chart-pct" x="16.91549431" y="15.5" alignment-baseline="central" text-anchor="middle" font-size="8" >{{value}}%</text>
              <text class="metric chart-sub" x="16.91549431" y="20.5" alignment-baseline="central" text-anchor="middle" font-size="2" >{{caption}}</text>
            </g>
          </svg>`;
      me.appendChild(DOM.parseHTML(DOM.format(tpl, this)));
      return elm;
    }

  }

  class ExoChartControls {}

  _defineProperty(ExoChartControls, "controls", {
    circularchart: {
      type: ExoCircularChart,
      note: "Simple circular chart (SVG)",
      demo: {
        mode: "html"
      }
    }
  });

  class ExoSchemaGenerator {
    constructor() {
      _defineProperty(this, "typeMap", {
        string: "text",
        number: "number",
        boolean: "switch",
        "null": "text"
      });

      _defineProperty(this, "defaultSchema", {
        "pages": [{
          "label": "",
          "intro": "",
          "fields": []
        }]
      });
    }

    generateFormSchema(DTO) {
      if (!DTO) throw "Missing DTO";
      if (typeof DTO === "string") DTO = JSON.parse(DTO);
      this.dto = DTO;
      let schema = { ...this.defaultSchema
      };

      for (var p in this.dto) {
        schema.pages[0].fields.push({
          name: p,
          caption: p,
          value: this.dto[p],
          ...this.getMatchingFieldSettingsFuzzy(p, this.dto[p])
        });
      }

      return schema;
    }

    getMatchingFieldSettingsFuzzy(name, value, metaData) {
      if (value === undefined) {
        value = this.getDefault(metaData);
      }

      let tp = this.typeMap[typeof value];
      return {
        type: tp || "text",
        caption: Core.toWords(name)
      };
    }

    getDefault(meta) {
      if (meta) {
        if (meta.type === "boolean") return false;else if (meta.type === "number") return 0;
      }

      return "";
    }

  }

  class ExoFormTheme {
    // exf-base-text
    constructor(exo) {
      _defineProperty(this, "containerTemplate1",
      /*html*/
      `<div data-id="{{id}}" class="exf-ctl-cnt {{class}}">
    <label title="{{caption}}">
        <div class="exf-caption">{{caption}}</div>
        
        <span data-replace="true"></span>
    </label>
</div>`);

      _defineProperty(this, "containerTemplate",
      /*html*/
      `<div data-id="{{id}}" class="exf-ctl-cnt {{class}}">
    <div class="exf-ctl">
        <label aria-hidden="true" class="exf-label" title="{{caption}}">Key</label>
        <span data-replace="true"></span>
    </div>
    <div class="exf-fld-details">
        <div class="exf-help-wrapper"></div>
    </div>
</div>`);

      this.exo = exo;
    }

    apply() {
      this.exo.container.classList.add("exf-theme-none");
      this.exo.form.addEventListener("focusin", e => {
        let cnt = e.target.closest(".exf-ctl-cnt");
        if (cnt) cnt.classList.add("exf-focus");
      });
      this.exo.form.addEventListener("focusout", e => {
        let cnt = e.target.closest(".exf-ctl-cnt");

        if (cnt) {
          cnt.classList.remove("exf-focus");

          if (e.target.value == '') {
            cnt.classList.remove('exf-filled');
          }
        }
      });
      this.exo.form.addEventListener("input", e => {
        let c = e.target;
        let cnt = c.closest(".exf-ctl-cnt");
        if (cnt) cnt.classList[c.value ? "add" : "remove"]("exf-filled");
      });
    }

  }

  class ExoFormFluentTheme extends ExoFormTheme {
    apply() {
      super.apply();
      this.exo.container.classList.add("exf-theme-fluent");
    }

  }

  class ExoFormMaterialTheme extends ExoFormTheme {
    apply() {
      super.apply();
      this.exo.container.classList.add("exf-theme-material");
      this.exo.form.querySelectorAll("[name][placeholder]").forEach(elm => {
        elm.setAttribute("data-placeholder", elm.getAttribute("placeholder") || "");
        elm.removeAttribute("placeholder");
      });
      this.exo.form.addEventListener("focusin", e => {
        e.target.setAttribute("placeholder", e.target.getAttribute("data-placeholder") || "");
      });
      this.exo.form.addEventListener("focusout", e => {
        e.target.removeAttribute("placeholder");
      });
    }

  }

  class ExoFormThemes {
    static getType(exo) {
      let type = exo.formSchema.theme;
      if (type === "auto" || type === undefined) type = ExoFormThemes.matchTheme(exo);
      let theme = ExoFormThemes.types[type];
      return theme || ExoFormTheme;
    }

    static matchTheme(exo) {
      return "material";
    }

  }

  _defineProperty(ExoFormThemes, "types", {
    auto: undefined,
    none: ExoFormTheme,
    fluent: ExoFormFluentTheme,
    material: ExoFormMaterialTheme
  });

  class ExoFormDefaultValidation {
    constructor(exo) {
      this.exo = exo;
      exo.form.setAttribute('novalidate', true);
    }

    checkValidity() {
      let numInvalid = this.exo.query(f => {
        return !f._control.valid;
      }).length;
      return numInvalid === 0;
    }

    reportValidity(page) {
      let invalidFields = this.exo.query(f => {
        return page === undefined ? !f._control.valid : page === f._page.index && !f._control.valid;
      }).map(f => {
        return {
          field: f,
          validationMessage: f._control.validationMessage
        };
      });

      if (invalidFields.length) {
        let returnValue = this.exo.triggerEvent(ExoFormFactory.events.reportValidity, {
          invalid: invalidFields
        });

        if (returnValue !== false) {
          console.log(invalidFields);
          this.focus(invalidFields[0].field);
        }
      }
    }

    focus(field) {
      let element = field._control.htmlElement;

      const f = field => {
        let element = field._control.htmlElement;

        field._control.showValidationError();

        if (!element.form) element = element.querySelector("[name]");
      };

      if (element.offsetParent === null) {
        // currently invisible
        let pgElm = element.closest('[data-page]');

        if (pgElm) {
          let page = parseInt(pgElm.getAttribute("data-page"));
          this.exo.gotoPage(page);
          setTimeout(() => {
            f(field);
          }, 20);
        }
      } else {
        f(field);
      }

      return true;
    }

  }

  class InlineFieldValidator {
    constructor(field) {
      this._field = field;
      this._cnt = this._field._control.container || this._field._control.htmlElement;
      this._error = null;
      this._onInvalid = this._onInvalid.bind(this); //this._onInput = this._onInput.bind(this);

      this._onChange = this._onChange.bind(this);
      this.bindEventListeners();
    }

    bindEventListeners() {
      if (this._cnt) {
        this._cnt.querySelectorAll("[name]").forEach(c => {
          c.addEventListener('invalid', this._onInvalid);
        });

        this._cnt.addEventListener("change", this._onChange);
      }
    } // Displays an error message and adds error styles and aria attributes


    showError() {
      this._field._control.showHelp(this._field._control.validationMessage, {
        type: "invalid"
      });
    } // Hides an error message if one is being displayed
    // and removes error styles and aria attributes


    hideError() {
      this._field._control.showHelp();
    } // Suppress the browsers default error messages


    _onInvalid(event) {
      event.preventDefault();
    }

    _onChange(event) {
      if (!this._field._control.valid) {
        this.showError();
      } else {
        this.hideError();
      }
    }

  }

  class ExoFormInlineValidation extends ExoFormDefaultValidation {
    constructor(exo) {
      super(exo);
      const form = exo.form;
      exo.on(ExoFormFactory.events.interactive, e => {
        exo.query().forEach(f => {
          f._control._validator = new InlineFieldValidator(f);
        }); // For some reason without setting the forms novalidate option
        // we are unable to focus on an input inside the form when handling
        // the 'submit' event

        form.setAttribute('novalidate', true);
      });
    }

    reportValidity(page) {
      const cb = page ? f => {
        return f._page.index === page && !f._control.valid; // only controls on given page
      } : f => {
        return !f._control.valid; // across all pages
      };
      let invalidFields = this.exo.query(cb);
      invalidFields.forEach(f => {
        f._control._validator.showError();
      });
    }

  }

  class ExoFormValidation {
    static getType(exo) {
      let type = exo.formSchema.validation;
      if (type === "auto" || typeof type === "undefined") type = ExoFormValidation.matchValidationType(exo);
      let tp = ExoFormValidation.types[type];
      return tp || ExoFormDefaultValidation;
    }

    static matchValidationType(exo) {
      return "inline";
    }

  }

  _defineProperty(ExoFormValidation, "types", {
    auto: undefined,
    html5: ExoFormDefaultValidation,
    inline: ExoFormInlineValidation
  });

  class ExoFormNavigationBase {
    constructor(exo) {
      _defineProperty(this, "buttons", {});

      this.exo = exo;
      this._visible = true;
    }

    get visible() {
      return this._visible;
    }

    set visible(value) {
      this._visible = value;
      let cnt = this.exo.form.querySelector(".exf-nav-cnt");
      if (cnt) DOM[this._visible ? "show" : "hide"]();
    }

    clear() {
      let cnt = this.exo.form.querySelector(".exf-nav-cnt");
      if (cnt) cnt.remove();
    }

    render() {
      const tpl =
      /*html*/
      `<fieldset class="exf-cnt exf-nav-cnt"></fieldset>`;
      this.container = DOM.parseHTML(tpl);

      for (var b in this.buttons) {
        this.addButton(b, this.buttons[b]);
      }

      this.exo.form.appendChild(this.container);
    }

    canMove(fromPage, toPage) {
      // to be subclassed
      console.debug("Check navigation from", fromPage, "to", toPage);
      return true;
    }

    addButton(name, options) {
      options = {
        class: "",
        type: "button",
        caption: name,
        name: name,
        ...(options || {})
      };
      const tpl =
      /*html*/
      `<button name="{{name}}" type="{{type}}" class="exf-btn {{class}}">{{caption}}</button>`;
      let btn = DOM.parseHTML(DOM.format(tpl, options));
      this.buttons[name].element = btn;
      this.container.appendChild(btn);
    }

    next() {
      this.exo.nextPage();
    }

    back() {
      this.exo.previousPage();
    }

    restart() {
      this.exo.gotoPage(1);
    }

    update() {}

  }

  class ExoFormNoNavigation extends ExoFormNavigationBase {}

  class ExoFormStaticNavigation extends ExoFormNavigationBase {
    render() {
      this.exo.on(ExoFormFactory.events.renderReady, e => {
        this.exo.form.querySelectorAll(".exf-page").forEach(elm => {
          elm.style.display = "block";
        });
      });
    }

  }

  class ExoFormDefaultNavigation extends ExoFormNavigationBase {
    constructor(...args) {
      super(...args);

      _defineProperty(this, "buttons", {
        "send": {
          caption: "Submit",
          class: "form-post"
        }
      });
    }

    render() {
      const _ = this;

      super.render();
      this.buttons["send"].element.addEventListener("click", e => {
        e.preventDefault();

        _.exo.submitForm();
      });
    }

  }

  class ExoFormWizardNavigation extends ExoFormDefaultNavigation {
    constructor(...args) {
      super(...args);

      _defineProperty(this, "buttons", {
        prev: {
          "caption": "Back",
          "class": "form-prev"
        },
        next: {
          "caption": "Next ↵",
          "class": "form-next"
        },
        send: {
          caption: "Submit",
          class: "form-post"
        }
      });
    }

    render() {
      const _ = this;

      super.render();
      this.buttons["prev"].element.addEventListener("click", e => {
        e.preventDefault();

        _.back();
      });
      this.buttons["next"].element.addEventListener("click", e => {
        e.preventDefault();

        _.next();
      });

      _.exo.on(ExoFormFactory.events.page, e => {
        let page = e.detail.page;
        let pageCount = e.detail.pageCount;
        DOM[page === 1 ? "disable" : "enable"](_.buttons["prev"].element);
        DOM[page === pageCount ? "disable" : "enable"](_.buttons["next"].element);
      }); // let steps = new WizardProgress(_.exo).render();
      // _.exo.container.insertBefore(steps, _.exo.form);

    }

  }

  class ExoFormSurveyNavigation extends ExoFormWizardNavigation {
    render() {
      const _ = this;

      super.render();

      const check = e => {
        let exf = e.target.closest("[data-exf]");

        if (exf && exf.data && exf.data.field) {
          _.checkForward(exf.data.field, "change", e);
        }
      };

      _.exo.form.querySelector(".exf-wrapper").addEventListener("change", check);

      _.exo.form.addEventListener("keydown", e => {
        if (e.keyCode === 8) {
          // backspace - TODO: Fix 
          if (e.target.value === "" && !e.target.selectionStart || e.target.selectionStart === 0) {
            _.exo.previousPage();

            e.preventDefault();
            e.returnValue = false;
          }
        } else if (e.keyCode === 13) {
          // enter
          if (e.target.type !== "textarea") {
            let exf = e.target.closest("[data-exf]");
            let field = ExoFormFactory.getFieldFromElement(exf);

            _.checkForward(field, "enter", e);

            e.preventDefault();
            e.returnValue = false;
          }
        }
      });

      _.exo.on(ExoFormFactory.events.page, e => {
        _.focusFirstControl();
      });

      let container = _.exo.form.closest(".exf-container");

      container.classList.add("exf-survey");

      _.exo.on(ExoFormFactory.events.interactive, e => {
        _.exo.form.style.height = container.offsetHeight + "px";

        _.exo.form.querySelectorAll(".exf-page").forEach(p => {
          p.style.height = container.offsetHeight + "px";
        });
      });
    }

    focusFirstControl() {
      const _ = this;

      var first = _.exo.form.querySelector(".exf-page.active .exf-ctl-cnt");

      if (first && first.offsetParent !== null) {
        first.closest(".exf-page").scrollIntoView();
        setTimeout(e => {
          let ctl = first.querySelector("[name]");
          if (ctl && ctl.offsetParent) ctl.focus();
        }, 20);
      }
    }

    checkForward(f, eventName, e) {
      const _ = this.exo;

      if (!_.container) {
        return;
      }

      _.container.classList.remove("end-reached");

      _.container.classList.remove("step-ready"); //var isValid = f._control.htmlElement.reportValidity ? f._control.htmlElement.reportValidity() : true;


      var isValid = f._control.valid;

      if (isValid || !_.formSchema.multiValueFieldTypes.includes(f.type)) {
        if (_.currentPage == _.getLastPage()) {
          _.container.classList.add("end-reached");

          _.form.appendChild(_.container.querySelector(".exf-nav-cnt"));
        } else {
          // special case: detail.field included - workaround 
          let type = f.type;
          if (e.detail && e.detail.field) type = e.detail.field;

          if (!["checkboxlist", "tags"].includes(type)) {
            // need metadata from controls
            _.nextPage();
          } else {
            _.container.classList.add("step-ready");
          }

          f._control.container.appendChild(_.container.querySelector(".exf-nav-cnt"));
        }
      }
    }

  }

  class ExoFormNavigation {
    static getType(exo) {
      let type = exo.formSchema.navigation;
      if (type === "auto") type = ExoFormNavigation.matchNavigationType(exo);
      return ExoFormNavigation.types[type];
    }

    static matchNavigationType(exo) {
      if (exo.formSchema.pages.length > 1) return "wizard";
      return "default";
    }

  }

  _defineProperty(ExoFormNavigation, "types", {
    auto: undefined,
    none: ExoFormNoNavigation,
    static: ExoFormStaticNavigation,
    default: ExoFormDefaultNavigation,
    wizard: ExoFormWizardNavigation,
    survey: ExoFormSurveyNavigation
  });

  class ExoFormNoProgress {
    constructor(exo) {
      this.exo = exo;
    }

    render() {
      this.exo.on(ExoFormFactory.events.page, e => {
        console.debug(this, "Paging", e);
      });
    }

  }

  class ExoFormDefaultProgress extends ExoFormNoProgress {}

  class ExoFormPageProgress extends ExoFormDefaultProgress {
    render() {
      super.render();
      let elms = this.exo.form.querySelectorAll(".exf-page:not([data-skip='true']) > legend");
      let index = 1;

      if (elms.length > 1) {
        elms.forEach(l => {
          l.innerHTML += ` <span class="exf-pg-prg">(${index}/${elms.length})</span>`;
          index++;
        });
      }
    }

  }

  class ExoFormStepsProgress extends ExoFormDefaultProgress {
    constructor(...args) {
      super(...args);

      _defineProperty(this, "container", null);

      _defineProperty(this, "templates", {
        progressbar:
        /*html*/
        `
            <nav class="exf-wiz-step-cnt">
                <div class="step-wizard" role="navigation">
                <div class="progress">
                    <div class="progressbar empty"></div>
                    <div class="progressbar prog-pct"></div>
                </div>
                <ul>
                    {{inner}}
                </ul>
                </div>
                
            </nav>`,
        progressstep:
        /*html*/
        `
            <li class="">
                <button type="button" id="step{{step}}">
                    <div class="step">{{step}}</div>
                    <div class="title">{{pagetitle}}</div>
                </button>
            </li>`
      });
    }

    render() {
      super.render();

      const _ = this;

      _.container = DOM.parseHTML(_.templates.progressbar.replace("{{inner}}", ""));
      _.ul = _.container.querySelector("ul");
      let nr = 0;

      _.exo.formSchema.pages.forEach(p => {
        nr++;

        _.ul.appendChild(DOM.parseHTML(DOM.format(this.templates.progressstep, {
          step: nr,
          pagetitle: p.legend
        })));
      });

      _.container.querySelectorAll(".step-wizard ul button").forEach(b => {
        b.addEventListener("click", e => {
          var step = parseInt(b.querySelector("div.step").innerText);

          _.exo[step > 0 ? "nextPage" : "previousPage"]();
        });
      });

      _.exo.on(window.xo.form.factory.events.page, e => {
        _.setClasses();
      }); //return this.container;


      this.exo.container.insertBefore(this.container, this.exo.form);
    }

    setClasses() {
      const _ = this;

      let index = _.exo.currentPage;

      let steps = _.exo.getLastPage();

      if (!_.container) return;
      if (index < 0 || index > steps) return;
      var p = (index - 1) * (100 / steps);

      let pgb = _.container.querySelector(".progressbar.prog-pct");

      if (pgb) pgb.style.width = p + "%";
      var ix = 0;

      _.container.querySelectorAll("ul li").forEach(li => {
        ix++;
        li.classList[ix === index ? "add" : "remove"]("active");
        li.classList[_.exo.isPageValid(ix) ? "add" : "remove"]("done");
      });

      _.container.querySelectorAll(".exf-wiz-step-cnt .step-wizard li").forEach(li => {
        li.style.width = 100 / steps + "%";
      });
    }

  }

  class ExoFormSurveyProgress extends ExoFormDefaultProgress {}

  class ExoFormProgress {
    static getType(exo) {
      let type = exo.formSchema.progress;
      if (type === "auto") type = ExoFormProgress.matchProgressType(exo);
      return ExoFormProgress.types[type];
    }

    static matchProgressType(exo) {
      if (exo.formSchema.pages.length > 1) {
        if (exo.formSchema.navigation === "static") return "none";
        return "page";
      }

      return "default";
    }

  }

  _defineProperty(ExoFormProgress, "types", {
    auto: undefined,
    none: ExoFormNoProgress,
    default: ExoFormDefaultProgress,
    page: ExoFormPageProgress,
    steps: ExoFormStepsProgress,
    survey: ExoFormSurveyProgress
  });

  /**
   * Hosts an ExoForm context to create forms with.
   * Created using {ExoFormFactory}.build()
   * 
   * @hideconstructor
   */

  class ExoFormContext {
    constructor(library) {
      this.library = this.enrichMeta(library);
    }

    enrichMeta(library) {
      const form = this.createForm();
      form.load({
        pages: [{}]
      });

      for (var name in library) {
        let field = library[name];
        let context = {
          exo: form,
          field: {
            name: name,
            type: name
          }
        };
        let control = name !== "base" ? new field.type(context) : {
          acceptedProperties: []
        };
        field.returns = field.returnValueType ? field.returnValueType.name : "None";
        field.element = control.htmlElement ? control.htmlElement.tagName.toLowerCase() : "none";
        field.properties = this.getProps(field, field.type, control);
        field._key = name;
      }

      return library;
    }

    getProps(field, type, control) {
      let ar = {};

      if (field.returnValueType) {
        ar.name = {
          type: "string",
          description: "Name of the field. Determines posted value key"
        };
        ar.required = {
          type: "boolean",
          description: "Makes the field required. The form cannot be posted when the user has not entered a value in thisn field."
        };
      }

      ar.caption = {
        type: "string",
        description: "Caption text. Normally shown in a label element within the field container"
      };

      if (control && control.acceptedProperties.length) {
        control.acceptedProperties.forEach(p => {
          let name = p;

          if (typeof p === "object") {
            name = p.name;
          }

          delete p.name;
          p.type = p.type || String;
          p.type = p.type.name;
          ar[name] = p;
        });
      }

      return ar;
    }

    createForm(options) {
      // the only place where an 
      // ExoForm instance can be created
      return new ExoForm(this, options);
    }

    get(type) {
      return this.library[type];
    }
    /**
    * Searches the control library using @param {Function} callback.
    * @return {Array} - list of matched controls.
    */


    query(callback) {
      for (var name in this.library) {
        var field = this.library[name];
        if (callback.apply(this, [field])) return field;
      }
    }

    isExoFormControl(formSchemaField) {
      let field = this.get(formSchemaField.type);
      return field.type.prototype instanceof ExoFormFactory.library.base.type;
    }

    renderSingleControl(field) {
      return this.createForm().renderSingleControl(field);
    }

    createGenerator() {
      return new ExoSchemaGenerator();
    } // get theme() {
    //     return this._theme;
    // }
    // set theme(value) {
    //     if (this.themes[value]) {
    //         this._theme = this.themes[value];
    //     }
    //     else {
    //         throw "Theme not registered"
    //     }
    // }


  }
  /**
   * Factory class for ExoForm - Used to create an ExoForm context.
   * Provides factory methods. Starting point for using ExoForm. 
   * 
   * @hideconstructor
   */

  class ExoFormFactory {
    //TODO: add all relevant classes

    /**
     * Build {ExoFormContext} instance.
     * 
     */
    static build(options) {
      options = options || {};
      return new Promise((resolve, reject) => {
        var promises = [];
        options.imports = options.imports || this.defaults.imports; // add standard controls from Base Libraries

        this.add(ExoBaseControls.controls);
        this.add(ExoExtendedControls.controls);
        this.add(ExoDevControls.controls);
        this.add(ExoChartControls.controls);

        if (options.add) {
          options.imports.push(...options.add);
        }

        options.imports.forEach(imp => {
          promises.push(ExoFormFactory.loadLib(imp));
        });
        Promise.all(promises).then(() => {
          let lib = ExoFormFactory.buildLibrary();
          console.debug("ExoFormFactory loaded library", lib, "from", options.imports);
          resolve(new ExoFormContext(lib));
        });
      });
    }

    static buildLibrary() {
      for (var name in ExoFormFactory.library) {
        var field = ExoFormFactory.library[name];
        field.typeName = name;
        field.returnValueType = String;
        field.type = this.lookupBaseType(name, field);
        field.isList = field.type.prototype instanceof ExoFormFactory.library.list.type;

        if (field.isList) {
          field.isMultiSelect = field.type.isMultiSelect;
        }

        field.returnValueType = field.type.returnValueType;

        if (["date"].includes(field.typeName)) {
          field.returnValueType = Date;
        }
      }

      return ExoFormFactory.library;
    }

    static lookupBaseType(name, field) {
      let type = field.type;

      while (type === undefined) {
        if (field.base) {
          field = this.library[field.base];
          if (!field) console.error("Invalid base type", field.base);
          type = field.type;

          if (!(type.prototype instanceof ExoFormFactory.library.base.type)) {
            console.error("Class for " + name + " is not derived from ExoControlBase");
          }
        } else {
          break;
        }
      }

      return type;
    }

    static async loadLib(src) {
      let lib = await import(src);
      let customType = lib.default;
      this.add(customType.controls);
    } // called from library implementations


    static add(lib) {
      //console.debug("Loading ", lib);
      for (var name in lib) {
        var field = lib[name];
        ExoFormFactory.library[name] = field;
      }
    }

    static listNativeProps(ctl) {
      let type = ctl.__proto__;
      let list = Object.getOwnPropertyNames(type);
      let ar =
      /* id added 26 Apr 2021*/
      ["id", "style", "class", "accesskey", "contenteditable", "dir", "disabled", "hidefocus", "lang", "language", "tabindex", "title", "unselectable", " xml:lang"];
      list.forEach(p => {
        let d = Object.getOwnPropertyDescriptor(type, p);
        let hasSetter = d.set !== undefined;

        if (hasSetter) {
          ar.push(p.toLowerCase());
        }
      });
      return ar;
    }

    static loadCustomControl(f, src) {
      return ExoFormFactory.importType(src);
    }

    static async importType(src) {
      return await import(src);
    }

    static checkTypeConversion(type, rawValue) {
      let fieldMeta = ExoFormFactory.library[type];
      let value = undefined;

      if (fieldMeta) {
        try {
          const parse = ExoFormFactory.getTypeParser(fieldMeta);
          value = parse(rawValue);
          if (value !== rawValue) console.debug("Value '", rawValue, "' for field", type, " converted to", value, typeof value);
        } catch (ex) {
          console.error("Error converting '" + value + "'to " + fieldMeta.returnValueType, ex);
        }
      }

      return value;
    }

    static getTypeParser(fieldMeta) {
      let type = fieldMeta.returnValueType;

      switch (type) {
        case Number:
          return Number.parseFloat;

        case Date:
          return ExoFormFactory.parseDate;

        case Boolean:
          return ExoFormFactory.parseBoolean;

        default:
          return v => {
            return v;
          };
      }
    }

    static parseDate(value) {
      let dateValue = Date.parse(value);
      if (!isNaN(dateValue)) return new Date(dateValue).toJSON();
      return dateValue;
    }

    static parseBoolean(value) {
      return parseInt(value) > 0 || value === "1" || value === "true" || value === "on";
    }

    static getFieldFromElement(e) {
      let field = null;

      if (e.getAttribute("data-exf")) {
        field = e.data["field"];
      } else if (e.classList.contains("exf-ctl-cnt")) {
        e = e.querySelector("[data-exf]");

        if (e) {
          field = e.data["field"];
        }
      } else {
        e = e.closest("[data-exf]");

        if (e) {
          field = e.data["field"];
        }
      }

      return field;
    }

    static fieldToString(f) {
      if (f) {
        let type = f.type || "unknown type";
        if (f.isPage) return "Page " + f.index + " (" + type + ")";else if (f.name || f.id && f.elm) return "Field '" + (f.name || f.id) + "' (" + type + ")";
      }

      return "Unknown field";
    }

  }

  _defineProperty(ExoFormFactory, "_ev_pfx", "exf-ev-");

  _defineProperty(ExoFormFactory, "events", {
    beforePage: ExoFormFactory._ev_pfx + "before-page",
    // cancellable - called just before paging
    page: ExoFormFactory._ev_pfx + "page",
    // after moving to other page
    getListItem: ExoFormFactory._ev_pfx + "get-list-item",
    // 
    post: ExoFormFactory._ev_pfx + "post",
    // on form post/submit
    renderStart: ExoFormFactory._ev_pfx + "render-start",
    // when form rendering starts
    renderReady: ExoFormFactory._ev_pfx + "render-ready",
    // when form rendering is complete
    change: ExoFormFactory._ev_pfx + "change",
    // when any control on the form changes
    reportValidity: ExoFormFactory._ev_pfx + "report-validity",
    // when form control validity is reported
    schemaLoaded: ExoFormFactory._ev_pfx + "form-loaded",
    // when loading the form schema is complete
    interactive: ExoFormFactory._ev_pfx + "form-interactive" // when form is actually shown to user

  });

  _defineProperty(ExoFormFactory, "meta", {
    navigation: {
      type: ExoFormNavigation,
      description: "Navigation component"
    },
    validation: {
      type: ExoFormValidation,
      description: "Validation component"
    },
    progress: {
      type: ExoFormProgress,
      description: "Progress display component"
    },
    theme: {
      type: ExoFormThemes,
      description: "Theme component"
    }
  });

  _defineProperty(ExoFormFactory, "Context", ExoFormContext);

  _defineProperty(ExoFormFactory, "defaults", {
    imports: []
  });

  _defineProperty(ExoFormFactory, "html", {
    classes: {
      formContainer: "exf-container",
      pageContainer: "exf-page",
      elementContainer: "exf-ctl-cnt",
      groupContainer: "exf-input-group",
      groupElementCaption: "exf-caption"
    }
  });

  _defineProperty(ExoFormFactory, "library", {});

  class RouteModule {
    constructor(app, route, path) {
      _defineProperty(this, "title", "Module");

      _defineProperty(this, "menuIcon", "ti-test");

      this.route = route;
      this.app = app;
      this.path = path;
      if (!app) throw "RouteModule constructor parameter 'app' not defined";
      if (!app.config) throw "app.config not defined";
    }

    init() {} // called just after instantiation. To be subclassed


    _unload() {
      document.head.querySelectorAll("[data-pwa]").forEach(e => {
        e.remove();
      });
      this.unload();
    }

    unload() {// to be implemented by subclasser
    } // subclass this if you need async stuff to be initialized


    async asyncInit() {
      return Promise.resolve();
    }

    execute() {
      const _ = this;

      _.asyncInit().then(() => {
        _._beforeRender();

        if (_.app.UI.areas.title) _.app.UI.areas.title.set(_.title);

        _.render(...arguments);
      });
    }

    render() {}

    _beforeRender() {
      const _ = this;

      for (var a in _.app.UI.areas) {
        _.app.UI.areas[a].empty = false;
      }
    }

  }

  class Router {
    constructor(app, routes, settings) {
      _defineProperty(this, "modules", []);

      const _ = this;

      Core.addEvents(this); // add simple event system

      _.app = app;
      _.routes = routes;

      _.setupHashListener(settings.onRoute);

      console.debug("Loading Route modules");

      _.loadModules().then(() => {
        console.debug("Loaded Route modules", _.modules);
        DOM.trigger(window, 'hashchange');
      }).then(() => {
        console.debug("Router Ready");
        settings.ready();
      });
    }

    _triggerEvent(eventName, detail, ev) {
      console.debug("Triggering event", eventName, "detail: ", detail);

      if (!ev) {
        ev = new Event(eventName, {
          "bubbles": false,
          "cancelable": false
        });
      }

      ev.detail = {
        router: this,
        ...(detail || {})
      };
      return this.dispatchEvent(ev);
    }

    on(eventName, func) {
      console.debug("Listening to event", eventName, func);
      this.addEventListener(eventName, func);
      return this;
    }

    static changeHash(anchor) {
      history.replaceState(null, null, document.location.pathname + '#' + anchor);
    }

    setupHashListener(callback) {
      this.routeCallback = (m, p) => {
        this._triggerEvent(Router.events.route, {
          module: m,
          path: p
        });

        callback(m, p);
      };

      const _ = this;

      window.addEventListener('hashchange', () => {
        _.hashChanged();
      });
    }

    hashChanged() {
      const _ = this;

      const W = window;
      var h = W.location.hash.substr(1);

      if (h.startsWith("/")) {
        let id = "/" + h.substr(1).split('/')[0];
        let path = h.substr(id.length);
        let route = _.routes[id];
        console.debug(W.location.hash, "RouteModule: ", route);

        if (route) {
          let m = _.findByRoute(route);

          if (m && m.module) {
            _._route = id;
            let html = document.querySelector("html");
            html.classList.forEach(c => {
              if (c.startsWith("route-")) {
                html.classList.remove(c);
              }
            });
            document.querySelector("html").classList.add("route-" + m.module.constructor.name);

            if (_.current) {
              _.current.module._unload();
            }

            _.current = m;

            _.routeCallback(m.module, path);
          }
        } else if (!h.startsWith("dlg-")) {
          _.home();
        }
      } else {
        _.home();
      }
    }

    set route(routePath) {
      if (!routePath.startsWith("/")) throw "Invalid route";
      let routeParts = routePath.substring(1).split('/');

      if (this.routes["/" + routeParts[0]]) {
        Router.changeHash(routePath); // update history, prevent endless redirects back to home router

        this.hashChanged();
      } else throw "Unknown route: " + routePath;
    }

    get route() {
      return this._route;
    }

    findByRoute(route) {
      return this.modules.find(x => {
        return x.route === route;
      });
    }

    findById(id) {
      return this.modules.find(x => {
        return x.path === id;
      });
    }

    loadModules() {
      const _ = this;

      let promises = [];
      let homeRouteFound = false;

      for (var r in _.routes) {
        if (r === "/") homeRouteFound = true;
        let route = _.routes[r];
        if (!r.startsWith('/')) throw "Malformed route: " + r;
        promises.push(new Promise((resolve, reject) => {
          if (route.prototype && route.prototype instanceof RouteModule) {
            let o = new route(_.app, route, r);
            resolve(o);
          } else if (typeof route === "string") {
            _.loadES6Module(route, _.app, route, r).then(o => {
              resolve(o);
            });
          }
        }));
      }

      if (!homeRouteFound) {
        throw "Router misconfiguration: no home (/) route found";
      }

      return Promise.all(promises).then(e => {
        e.forEach(o => {
          _.modules.push({ ...o,
            route: o.route,
            url: "#" + o.path,
            module: o
          });
        });
      });
    }

    loadES6Module(src) {

      src = new URL(src, this.app.config.baseUrl);
      let args = Array.prototype.slice.call(arguments, 1);

      const imp = async src => {
        try {
          return await import(
          /* webpackMode: "eager" */
          src);
        } catch (ex) {
          throw "Could not load " + src + ": " + ex;
        }
      };

      return imp(src).then(x => {
        let h = x.default;
        let mod = new h(...args);
        mod.init();
        return mod;
      });
    }

    home() {
      this.route = "/";
    }

    generateMenu(menu) {
      const _ = this;

      const menuTpl =
      /*html*/
      `<nav class="main-menu"><ul>{{inner}}</ul></nav>`;
      const menuItemTpl =
      /*html*/
      `<li class="{{class}}" data-module="{{name}}" title="{{title}}"><a href="{{url}}"><span class="{{menuIcon}}"></span> <span class="name">{{menuTitle}}</span></a></li>`;
      let ar = [];

      _.modules.forEach(m => {
        if (!m.hidden) {
          let o = { ...m,
            name: m.module.constructor.name
          };
          o.menuTitle = o.menuTitle || m.title;
          let s = DOM.format(menuItemTpl, o);
          ar.push(s);
        }
      });

      let ul = DOM.format(menuTpl, {
        inner: ar.join('')
      });
      menu.add(DOM.parseHTML(ul));
      menu.element.addEventListener("click", e => {
        const _ = this;

        if (e.target.closest("li")) {
          _.app.UI.areas.menu.element.classList.add("clicked");

          if (!this.touchStarted) {
            setTimeout(() => {
              _.app.UI.areas.menu.element.classList.remove("clicked");

              _.touchStarted = false;
            }, 1500);
          }
        }
      }); // handle special mobile case to prevent menu from opening 
      // when mouse

      menu.element.addEventListener("touchstart", e => {
        this.touchStarted = true;

        if (_.config.areas.menu) {
          let menu = e.target.closest(_.config.areas.menu);

          if (menu) {
            if (e.target.closest("li")) {
              menu.classList.add("clicked");
            } else {
              menu.classList.remove("clicked");
            }
          }
        }
      });
      return menu;
    }

  }

  _defineProperty(Router, "_ev_pfx", "pwa-ev-");

  _defineProperty(Router, "events", {
    route: Router._ev_pfx + "route"
  });

  class PWA_Notifications {
    constructor(ui) {
      this.UI = ui;
    }

    add(msg, options) {
      options = options || {
        type: "info"
      };
      if (!msg) msg = "An unknown error has occurred";else if (typeof msg !== "string") msg = msg.toString();
      const tpl =
      /*html*/
      `
            <div class="pwa-notif pwa-{{type}}">
                <div class="pwa-cnt">
                    <span>{{msg}}</span>
                    <div class="pwa-notif-btns"></div>
                    <progress value="100" max="100"></progress>
                </div>
            </div>
        `;
      let notif = DOM.parseHTML(DOM.format(tpl, {
        type: options.type,
        msg: msg
      }));

      if (options.buttons) {
        let notifBtn = notif.querySelector(".pwa-notif-btns");

        for (var b in options.buttons) {
          let btn = options.buttons[b];
          let btnHtml = DOM.parseHTML(DOM.format(`<button class="exf-btn">{{caption}}</button>`, btn));
          notifBtn.appendChild(btnHtml);
          btnHtml.addEventListener("click", e => {
            e.stopPropagation();
            btn.click(e);
          });
        }
      }

      notif.addEventListener("click", () => {
        notif.remove();
      });
      const timeout = options.timeout || 2000 + msg.split(' ').length * 200;
      document.body.appendChild(notif);
      let prog = notif.querySelector("progress");
      prog.setAttribute("value", "100");
      var i = 100,
          countDown;
      countDown = setInterval(() => {
        i--;
        prog.setAttribute("value", i.toString());
        if (i <= 0) clearInterval(countDown);
      }, timeout / 100);
      setTimeout(() => {
        notif.classList.add("move-out");
        setTimeout(() => {
          notif.remove();
        }, 2000);
      }, timeout);
    }

  }

  class PWA_Area {
    constructor(name, element) {
      this.name = name;

      const _ = this;

      _.element = element;

      _.checkPinnable();
    }

    add(e) {
      if (!e) return;

      try {
        if (typeof e == "string") {
          if (e.indexOf('<') === -1) e = DOM.parseHTML('<span>' + e + '</span>');else e = DOM.parseHTML(e);
        }

        this.element.appendChild(e);
      } catch (ex) {
        throw "Area.add failed for " + e + ". " + ex.toString();
      }
    }

    set(s) {
      this.element.innerHTML = s;
    }

    clear() {
      this.set("");
    }

    checkPinnable() {
      const _ = this;

      if (_.element.classList.contains("pwa-pinnable")) {
        // check hover over pin icon (cannot be done using CSS, since it's a pseudo-element - :before )
        _.element.addEventListener("mouseover", e => {
          let overPin = e.offsetX > _.element.offsetWidth - 70 && e.offsetY < 70;

          if (overPin) {
            _.pinActive = true;

            _.element.classList.add("pin-active");
          } else if (_.pinActive) {
            _.pinActive = false;

            _.element.classList.remove("pin-active");
          }
        });

        _.element.addEventListener("click", e => {
          if (_.pinActive) {
            _.pinned = !_.pinned;
          }
        });
      }
    }

    get pinned() {
      return this.element.classList.contains("pinned");
    }

    set pinned(value) {
      this.element.classList[value ? "add" : "remove"]("pinned");

      if (!value) {
        this.element.classList.remove("pin-active");
      }
    } // bosy state


    set busy(value) {
      if (value) {
        this.element.classList.add("pwa-loading");
      } else {
        this.element.classList.remove("pwa-loading");
      }
    }

    get busy() {
      this.element.classList.add("pwa-loading");
    } // empty state


    set empty(value) {
      clearTimeout(this.rtimer);
      clearTimeout(this.atimer);

      if (value) {
        this.element.classList.remove("remove");
        this.rtimer = setTimeout(() => {
          this.element.classList.remove("add");
        }, 100);
        this.element.classList.add("pwa-empty-state", "add");
      } else {
        this.element.classList.add("remove");
        this.rtimer = setTimeout(() => {
          this.element.classList.remove("pwa-empty-state", "remove");
        }, 500);
      }
    }

    get empty() {
      return this.element.classList.includes("pwa-empty-state");
    }

  }

  class PWA_UI {
    constructor(pwa) {
      _defineProperty(this, "_dirtyMessage", 'If you continue your changes will not be saved.');

      _defineProperty(this, "_dirty", false);

      _defineProperty(this, "areas", {});

      _defineProperty(this, "notifications", new PWA_Notifications(this));

      const _ = this;

      this.pwa = pwa;
      this.html = document.querySelector("html");

      if (this.pwa.id) {
        this.html.setAttribute("id", this.pwa.id);
      }

      this.pwa.config.UI.user = {
        prefersDarkScheme: window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)").matches : false,
        currentTheme: localStorage.getItem("theme") || "light"
      };

      if (!this.pwa.config.UI.allowUserSelection) {
        this.html.classList.add("no-user-select");
      }

      if ('ontouchstart' in window) {
        this.html.classList.add('pwa-touch');
      }

      if (this.forceTheme) {
        this.theme = this.forceTheme;
      } else {
        if (this.pwa.config.UI.user.currentTheme === undefined) {
          this.theme = this.pwa.config.UI.user.prefersDarkScheme ? "dark" : "light";
        } else {
          this.theme = this.pwa.config.UI.user.currentTheme;
        }
      }

      window.addEventListener("beforeunload", function (event) {
        // Cancel the event as stated by the standard.
        event.preventDefault(); // Chrome requires returnValue to be set.

        if (!_.dirty) delete event['returnValue'];else {
          event.returnValue = '';
        }
      });

      this._setAreas();
    }

    set dirty(value) {
      this._dirty = true;
    }

    get dirty() {
      return this._dirty;
    }

    _setAreas() {
      let ar = document.querySelectorAll("[data-pwa-area]");
      if (!ar.length) throw "No PWA areas defined";
      ar.forEach(element => {
        var areaName = element.getAttribute("data-pwa-area");
        this.areas[areaName] = new PWA_Area(areaName, element);
      });
    }

    get theme() {
      return this._theme || "light";
    }

    set theme(value) {
      this._theme = value;
      let schemes = document.querySelector("head > meta[name='color-scheme']");

      if (schemes) {
        schemes.setAttribute("content", value);
        localStorage.setItem("theme", value);
        document.querySelector("html").classList.remove("theme-dark", "theme-light");
        document.querySelector("html").classList.add("theme-" + value);
      } else {
        console.warn("Theming depends on meta[name='color-scheme']");
      }
    }

    addStyleSheet(url) {
      DOM.addStyleSheet(url, {
        "data-pwa": this.pwa.router.current.path
      });
    }

    async showDialog(options) {
      let ctx = await window.xo.form.factory.build();
      let frm = ctx.createForm();
      frm.renderSingleControl({ ...(options || {}),
        type: "dialog"
      }).then(r => {
        var f = window.xo.form.factory.getFieldFromElement(r);

        f._control.show();
      });
    }

  }

  class PWA_EventHub {
    constructor(app) {
      this.app = app;
      Core.addEvents(this); // add simple event system
    }

    async init() {
      return new Promise((resolve, reject) => {
        const sr = this.app.config.signalR;

        if (sr && sr.enabled) {
          DOM.require("https://cdn.jsdelivr.net/npm/@aspnet/signalr@1.1.2/dist/browser/signalr.js", () => {
            const signalRConnection = new signalR.HubConnectionBuilder().withUrl(sr.notificationServiceUrl + "/api").configureLogging(signalR.LogLevel[sr.logLevel]) //don't use in production
            .build();
            signalRConnection.on('newMessage', msg => {
              console.debug("signalR", msg);

              this._triggerEvent(msg.notificationDTO.useCase, { ...msg.notificationDTO
              });
            });
            signalRConnection.onclose(() => console.log('disconnected'));
            console.log("Starting signalR connection ", sr.notificationServiceUrl);
            signalRConnection.start().then(() => true).catch(console.error);
            resolve();
          });
        } else {
          resolve();
        }
      });
    }

    on(eventName, func) {
      console.debug("Listening to event", eventName, func);
      this.addEventListener(eventName, func);
      return this;
    }

    _triggerEvent(eventName, detail, ev) {
      console.debug("Triggering event", eventName, "detail: ", detail);

      if (!ev) {
        ev = new Event(eventName, {
          "bubbles": false,
          "cancelable": true
        });
      }

      ev.detail = {
        eventHub: this,
        ...(detail || {})
      };
      return this.dispatchEvent(ev);
    }

  }

  class PWA_RESTService {
    constructor(app) {
      this.app = app;
    }

    send(endpoint, options) {
      const _ = this;

      const headers = new Headers();
      options = options || {};
      endpoint = new URL(endpoint, this.app.config.baseUrl);
      const fetchOptions = {
        method: "GET",
        ...options
      };

      let tokenAcquirer = scope => {
        return Promise.resolve();
      };

      if (!options.isAnonymous) {
        tokenAcquirer = () => {
          return _.app.getToken.apply(_.app);
        };
      }

      return tokenAcquirer().then(r => {
        if (r && r.accessToken) {
          headers.append("Authorization", `Bearer ` + r.accessToken);
        } else {
          console.warn("No JWT Token provided. Continuing anonymously");
        }

        if (options.headers) {
          for (var h in options.headers) {
            headers.append(h, options.headers[h]);
          }
        }

        fetchOptions.headers = headers;

        if (fetchOptions.method === "DELETE") {
          return fetch(endpoint, fetchOptions);
        }

        return fetch(endpoint, fetchOptions).then(x => x.json());
      });
    }

    get(endpoint, options) {
      options = { ...(options || {}),
        method: "GET"
      };
      return this.send(endpoint, options);
    }

    post(endpoint, options) {
      options = { ...(options || {}),
        method: "POST"
      };
      return this.send(endpoint, options);
    }

    put(endpoint, options) {
      options = { ...(options || {}),
        method: "PUT"
      };
      return this.send(endpoint, options);
    }

    delete(endpoint, options) {
      options = { ...(options || {}),
        method: "DELETE"
      };
      return this.send(endpoint, options);
    }

  }

  class PWA {
    constructor(options) {
      _defineProperty(this, "defaults", {
        UI: {
          allowUserSelection: false
        },
        serviceWorker: {
          src: null
        }
      });

      const _ = this;

      Core.addEvents(this); // add simple event system

      document.querySelector("html").classList.add("pwa-signin-pending");
      this.config = { ...this.defaults,
        ...(options || {})
      };
      this.config.baseUrl = document.location.origin;
      this.config.environment = ["localhost", "127.0.0.1"].includes(document.location.hostname) ? "debug" : "prod";
      console.debug("Checking for serviceWorker in config: serviceWorker.src");

      if (_.config.serviceWorker.src) {
        _.registerWorker(_.config.serviceWorker);
      }

      console.debug("PWA Config", this.config);
      this.restService = new PWA_RESTService(this);
      this.eventHub = new PWA_EventHub(this);
      this.eventHub.init().then(() => {
        this.asyncInit().then(() => {
          this.UI = new PWA_UI(this);

          _.init();

          _.execute();
        });
      });
      let cl = document.querySelector("html").classList;
      this.forceTheme = cl.contains("theme-dark") ? "dark" : cl.contains("theme-light") ? "light" : undefined;
      cl.add("pwa-env-" + this.config.environment);
    }

    triggerEvent(eventName, detail, ev) {
      console.debug("Triggering event", eventName, "detail: ", detail);

      if (!ev) {
        ev = new Event(eventName, {
          "bubbles": false,
          "cancelable": true
        });
      }

      ev.detail = {
        app: this,
        ...(detail || {})
      };
      return this.dispatchEvent(ev);
    }

    on(eventName, func) {
      console.debug("Listening to event", eventName, func);
      this.addEventListener(eventName, func);
      return this;
    }

    registerWorker(serviceWorker) {
      console.debug("Register PWA ServiceWoker..." + serviceWorker.src);

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(serviceWorker.src).then(function (registration) {
          console.debug('Registration successful, scope is:', registration.scope);
          /*
          registration.sync.register('myFirstSync');
          
          _.addEventListener('sync', function(event) {
              if (event.tag == 'myFirstSync') {
                  event.waitUntil(doSomeStuff());
              }
          });
          */
        }).catch(function (error) {
          console.log('Service worker registration failed, error:', error);
        });
      }
    }

    init() {// to subclass
    }

    asyncInit() {
      return Promise.resolve();
    }

    execute(async) {
      const _ = this;

      this.setupUI();
      _.router = new Router(_, this.config.routes, {
        onRoute: (mod, path) => {
          console.debug("PWA Executes Route", mod, path);

          if (!this.triggerEvent("pwa.route", {
            module: mod,
            path: path
          })) {
            return;
          }

          mod.execute(path);
        },
        ready: () => {
          console.debug("PWA Router Ready");

          _.routerReady();
        }
      });
    }

    rest(endpoint, options) {
      return this.restService.send(endpoint, options);
    }

    get signedIn() {
      return window.account != null;
    }

    getToken() {
      // to be subclassed
      return Promise.resolve();
    }

    setupUI() {} // to be subclassed


    routerReady() {} // to be subclassed


  }

  _defineProperty(PWA, "RouteModule", RouteModule);

  _defineProperty(PWA, "Router", Router);

  class ExoRouteModule extends PWA.RouteModule {
    // subclass PWA.RouteModule for modules to
    // get an ExoFormContext to create ExoForms
    async asyncInit() {
      this.exoContext = await ExoFormFactory.build();
    }

  }

  class ExoWizardRouteModule extends ExoRouteModule {
    constructor(...args) {
      super(...args);

      _defineProperty(this, "title", "Wizard");

      _defineProperty(this, "menuIcon", "ti-wand");
    }

    formLoaded() {} // for subclassing


    wizardRendered() {} // for subclassing


    post(obj) {
      alert(JSON.stringify(obj, null, 2));
    }

    event(e) {}

    unload() {
      this.app.UI.areas.main.clear(); // clean up wizard progress

      let wp = document.querySelector(".exf-wiz-step-cnt");
      if (wp) wp.remove();
      document.body.classList.remove("exf-fs-progress");
    }

    render() {
      const _ = this;

      _.engine = _.exoContext.createForm({
        host: _
      }).on(ExoFormFactory.events.post, e => {
        _.post(e.detail.postData);
      });
      let u = null;
      if (_.wizardSettings.url) u = new URL(_.wizardSettings.url, _.app.config.baseUrl).toString();else {
        u = _.wizardSettings.schema;
      }

      _.engine.load(u).then(x => {
        _.formLoaded();

        x.addEventListener(ExoFormFactory.events.page, e => {
          DOM.changeHash(_.path + "/page/" + e.detail.page);
        });
        x.renderForm().then(x => {
          _.app.UI.areas.main.clear();

          _.app.UI.areas.main.add(x.container);

          _.wizardRendered(x);
        });
      });
    }

  }

  class MsIdentity {
    constructor(options) {
      _defineProperty(this, "options", {
        mode: "redirect",
        libUrl: "https://alcdn.msauth.net/browser/2.7.0/js/msal-browser.js",
        msal: {
          auth: {
            clientId: "<clientid>",
            authority: "<authority>",
            redirectUri: document.URL.split("#")[0]
          },
          cache: {
            //cacheLocation: "sessionStorage", // This configures where your cache will be stored
            cacheLocation: 'localStorage',
            storeAuthStateInCookie: false // Set this to "true" if you are having issues on IE11 or Edge

          },
          system: {
            loggerOptions: {
              loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                  return;
                }

                switch (level) {
                  case msal.LogLevel.Error:
                    console.error(message);
                    return;

                  case msal.LogLevel.Info:
                    console.info(message);
                    return;

                  case msal.LogLevel.Verbose:
                    console.debug(message);
                    return;

                  case msal.LogLevel.Warning:
                    console.warn(message);
                    return;
                }
              }
            }
          },
          loginRequest: {
            scopes: ["User.Read"]
          },
          tokenRequest: {
            scopes: ["User.Read"],
            forceRefresh: false // Set this to "true" to skip a cached token and go to the server to get a new token

          }
        }
      });

      var _ = this;

      options = options || {};
      _.options = { ...this.options,
        ...options
      };
    } // Loads lib and initializes MSAL


    async load() {
      const _ = this;

      return await new Promise((resolve, reject) => {
        _.require(_.options.libUrl, e => {
          console.debug(_.options.libUrl, "loaded");

          _.init();

          resolve(this);
        });
      });
    }

    require(src, c) {
      var d = document;
      d.querySelectorAll("head");
      let e = d.createElement('script');
      e.src = src;
      d.head.appendChild(e);
      e.onload = c;
    }

    static trigger(x) {
      let ev = new Event("msid");
      ev.detail = x;
      document.body.dispatchEvent(ev);
    }

    init() {
      var _ = this;

      _.myMSALObj = new msal.PublicClientApplication(_.options.msal);

      if (_.options.mode !== "popup") {
        _.myMSALObj.handleRedirectPromise().then(r => {
          _.handleResponse(r);
        }).catch(error => {
          console.error(error);
        });
      }

      _.getAccount();
    }

    signIn(email) {
      var _ = this;

      const account = _.getAccount();

      if (!account) {
        if (_.options.mode === "popup") {
          _.myMSALObj.loginPopup(_.options.msal.loginRequest).then(response => {
            if (response !== null) {
              _.account = response.account;

              _.signedIn();
            }
          }).catch(error => {
            console.error(error);
          });
        } else {
          _.myMSALObj.loginRedirect(_.options.msal.loginRequest);
        }
      }
    }

    signedIn() {
      var _ = this;

      MsIdentity.trigger({
        type: "signedIn",
        account: _.account,
        mode: _.options.mode
      });
    }

    signOut() {
      var _ = this;

      if (_.account) {
        _.myMSALObj.logout({
          account: _.myMSALObj.getAccountByUsername(_.account.username)
        }).then(() => {
          MsIdentity.trigger({
            type: "signedOut",
            account: _.account,
            mode: _.options.mode
          });
        });
      }
    }

    getAccount() {
      var _ = this;

      const currentAccounts = _.myMSALObj.getAllAccounts();

      if (currentAccounts.length === 0) {
        return null;
      } else if (currentAccounts.length > 1) {
        throw "Multiple accounts detected.";
      } else if (currentAccounts.length === 1) {
        _.account = currentAccounts[0];

        _.signedIn();
      }
    } // https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md


    getJWT(username) {
      const _ = this;

      const request = _.options.msal.tokenRequest;
      return _.waitForInit().then(() => {
        if (!username) throw "No user signed in";
        request.account = _.myMSALObj.getAccountByUsername(username);
        return _.myMSALObj.acquireTokenSilent(request).catch(error => {
          if (error instanceof msal.InteractionRequiredAuthError) {
            // fallback to interaction when silent call fails
            // if (_.options.mode === "popup") {
            //     return _.myMSALObj.acquireTokenPopup(request)
            //         .then(tokenReinteractionsponse => {
            //             console.log(tokenResponse);
            //             return tokenResponse;
            //         }).catch(error => {
            //             console.error(error);
            //         });
            // }
            // else {
            return _.myMSALObj.acquireTokenRedirect(request); //}
          } else {
            console.warn(error);
          }
        });
      });
    } // TODO improve - loading MSAL is async, we have to wait until it is fully loaded


    waitForInit() {
      const _ = this;

      const delay = t => new Promise(resolve => setTimeout(resolve, t));

      if (!_.myMSALObj) {
        return delay(200);
      }

      return delay(1);
    }

    handleResponse(response) {
      var _ = this;

      if (response !== null) {
        _.account = response.account;
        if (!_.isBusy()) _.signedIn();
      }
    }

    isBusy() {
      return this.myMSALObj.interactionInProgress();
    }

  }

  const xo = {
    core: Core,
    dom: DOM,
    pwa: PWA,
    route: ExoRouteModule,
    form: {
      factory: ExoFormFactory,
      fields: {
        base: ExoBaseControls
      },
      wizard: ExoWizardRouteModule
    },
    identity: {
      msal: MsIdentity
    }
  };
  window.xo = xo;

  return xo;

})));
