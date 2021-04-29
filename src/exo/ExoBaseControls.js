import ExoFormFactory from './ExoFormFactory';
import ExoForm from './ExoForm';
import Core from '../pwa/Core';
import DOM from '../pwa/DOM';

//#region Controls

class ExoControlBase {
    attributes = {};

    acceptedProperties = [];

    dataProps = {};

    static returnValueType = undefined;

    containerTemplate = ExoForm.meta.templates.empty;

    constructor(context) {

        if (this.constructor === ExoControlBase)
            throw new Error("Can't instantiate abstract class!");


        this.context = context;
        if (!context || !context.field || !context.exo)
            throw "Invalid instantiation of ExoControlBase";

        this.htmlElement = DOM.parseHTML('<span/>');
    }

    _getContainerTemplate(obj) {

        if (this.context.field.isPage) {
            return DOM.format(this.containerTemplate, this._getContainerAttributes())
        }

        else if (this.context.field.type === "button") {

            const tpl = /*html*/`<div data-id="{{id}}" class="exf-ctl-cnt {{class}"><span data-replace="true"></span></div>`;

            return DOM.format(tpl, this._getContainerAttributes())
        }

        return /*html*/`<div data-id="${obj.id}" class="${obj.class}" data-field-type="${obj.type}">
    <div class="exf-ctl">
        <label for="${obj.id}" aria-hidden="true" class="exf-label" title="${obj.caption}">${obj.caption}</label>
        <span data-replace="true"></span>
    </div>
    <div class="exf-fld-details">
        <div class="exf-help-wrapper"></div>
    </div>
</div>`;
    }

    set htmlElement(el) {
        this._htmlElement = el;
        this.allowedAttributes = ExoFormFactory.listNativeProps(this.htmlElement);
        this.isSelfClosing = [
            "area", "base", "col", "embed", "hr", "img", "input",
            "link", "meta", "param", "source", "track", "wbr"
        ].includes(el.tagName.toLowerCase());


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
            if (typeof (p) === "string") {
                p = {
                    name: p
                }
            }

            let prop = this.acceptedProperties.find(e => {
                return e.name === p.name
            })
            if (!prop) {
                this.acceptedProperties.push(p);
                if (this.context.field[p.name] !== undefined)
                    this[p.name] = this.context.field[p.name];
            }
        });
    }

    get enabled() {
        return !this.htmlElement.disabled;
    }

    _scope() {
        let f = this.context.field;
        return {
            ...f,
            caption: f.caption || "",
            tooltip: f.tooltip || "",
            class: "",
            id: f.id
        }
    }

    _addContainerClasses() {
        this.container.classList.add(...this._getContainerClasses())
    }

    _getContainerClasses() {
        let ar = ["exf-ctl-cnt"];

        ar.push("exf-base-" + this._getBaseType())

        if (this.context.field.containerClass) {
            let cc = this.context.field.containerClass.trim().split(" ");
            cc.forEach(c => {
                ar.push(c);
            })
        }

        if (this.htmlElement.tagName === "INPUT" || this.htmlElement.tagName === "TEXTAREA" )
            ar.push("exf-input");

        if (this.context.field.readOnly)
            ar.push("exf-readonly");

        if (this.context.field.disabled)
            ar.push("exf-disabled");

        return ar;
    }

    _getBaseType() {

        let returns = this.context.field.returnValueType ? this.context.field.returnValueType.name : "String";

        if (this.isTextInput)
            return "text";

        if (returns === "Boolean")
            return "bool";

        if (returns === "Array")
            return "multi";

        return "default";
    }

    async render() {
        this.setProperties();

        for (var a in this.attributes) {
            this._htmlElement.setAttribute(a, this.attributes[a]);
        }
        for (var a in this.dataProps) {
            this._htmlElement.setAttribute("data-" + a, this.dataProps[a]);
        }

        this.container = DOM.parseHTML(

            this._getContainerTemplate(this._scope())

        );

        if (this.container.getAttribute("data-replace") === "true")
            this.container = this.htmlElement;
        else {
            let toReplace = this.container.querySelector('[data-replace="true"]');
            if (!toReplace)
                this.container = this.htmlElement;
            else
                DOM.replace(toReplace, this.htmlElement);
        }

        this.addEventListeners();

        if (this.context.field.required) {
            this.container.classList.add("exf-required");
        }

        this._addContainerClasses();

        return this.container
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
            }
            else
                return exo.testValidity(e, f);

        });

        _.htmlElement.addEventListener("change", e => {
            let isDirty = e.target.value != e.target.defaultValue;
            let el = e.target.closest(".exf-ctl-cnt");
            if (el)
                el.classList[isDirty ? "add" : "remove"]("exf-dirty");
        })
    }

    _getContainerAttributes() {
        let f = this.context.field;
        return {
            ...f,
            caption: f.caption || "",
            tooltip: f.tooltip || "",
            class: (f.containerClass || ""), //+ this.isTextInput ? " exf-base-text" : "" ,
            id: this.id + "-container"
        }
    }


    setProperties() {
        let f = this.context.field;

        for (var prop in f) {
            if (ExoForm.meta.properties.reserved.includes(prop))
                continue;

            let value = f[prop.toLowerCase()];
            let useName = prop;// ExoForm.meta.properties.map[prop] || prop;

            if (this.allowedAttributes.includes(useName)) {
                this.attributes[useName] = value;
            }
            else {

                if (typeof (value) === "object") {
                    this[useName] = value;
                }
                else {
                    if (!this.acceptedProperties || !this.acceptedProperties.includes(useName)) {
                        this.dataProps[useName] = value;
                    }
                }
            }
        }
    }

    // returns valid state of the control - can be subclassed
    get valid() {

        let numInvalid = 0;
        this.container.querySelectorAll("*").forEach(el => {
            if (el.reportValidity) {
                try {
                    if (!el.reportValidity()) {
                        numInvalid++;
                    }
                }
                catch { }
            }
        })

        // let input = this.container.querySelector("[name]");

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
        })
        return msg;
    }

    showValidationError() {
        if (this.htmlElement && this.htmlElement.reportValidity)
            return this.htmlElement.reportValidity()

        return true;
    }

    /**
     * Displays a help text to the user. Pass with empty @msg to hide.
     * @param {String} msg - The message to display
     * @param {Object} options - The options (type: "info|error|invalid")
     * @returns 
     */
    showHelp(msg, options){

        if(!msg){
            if (this._error != null) {
                this._error.parentNode.removeChild(this._error);
                this._error = null;
            }
    
            if (this.container){
                this.container.removeAttribute('aria-invalid');
                this.container.classList.remove("exf-invalid");
            }
            return;
        }

        options = options || {type: "info"};

        if (this._error != null) {
           this._error.innerHTML = msg
           return;
        }

        this._error = DOM.parseHTML(`<div class="exf-help exf-help-${options.type}">${msg}</div>`)

        if(options.type === "invalid"){
            this.container.setAttribute('aria-invalid', 'true');
            this.container.classList.add('exf-invalid');
        }
        
        this.container.querySelector(".exf-help-wrapper").appendChild(this._error);

    }
}

export class ExoElementControl extends ExoControlBase {

    static returnValueType = undefined;

    containerTemplate = ExoForm.meta.templates.empty;

    constructor(context) {
        super(context);

        if (context.field.tagName) {
            try {
                this.htmlElement = DOM.parseHTML('<' + context.field.tagName + '/>');
                if (this.htmlElement.nodeName !== context.field.tagName.toUpperCase()) {
                    throw "'" + context.field.tagName + "' is not a valid tagName";
                }

                if (!this.isSelfClosing) {
                    this.acceptProperties(
                        {
                            name: "html",
                            type: String,
                            description: "Inner HTML"
                        }
                    );
                }


                if (this.html) {
                    this.htmlElement.innerHTML = this.html;
                }

            }
            catch (ex) {
                throw "Could not generate '" + context.field.tagName + "' element: " + ex.toString();
            }
        }
    }
}

class ExoLinkControl extends ExoElementControl {

    constructor(context) {
        super(context);

        this.htmlElement = document.createElement("a");

        this.acceptProperties(
            {
                name: "external",
                type: Boolean,
                description: "External to open in new tab"
            },
            {
                name: "html",
                type: String
            }
        );
    }

    async render() {
        if (this.external)
            this.htmlElement.setAttribute("target", "_blank");

        return super.render();
    }
}

export class ExoInputControl extends ExoElementControl {
    //containerTemplate = ExoForm.meta.templates.default;

    static returnValueType = String;

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
            this.createEmailLookup()
        }

        await super.render();

        this.testDataList();


        switch(this.context.field.type){
            case "color":
                this.container.classList.add("exf-std-lbl");
                break;
        }


        return this.container
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
                }
            }
            else {
                let dl = _.container.querySelector("datalist");
                if (dl) {
                    dl.remove();
                }
                e.preventDefault();
            }
        })
    }


    testDataList() {
        const _ = this;

        let f = _.context.field;

        if (f.lookup) {
            if (Array.isArray(f.lookup)) {
                _.createDataList(f, f.lookup);
            }
            else {
                let query = (q) => {
                    // TODO: query REST 
                    let url = f.lookup.replace(".json", "_" + q + ".json");
                    url = new URL(url, _.formSchema.baseUrl);

                    fetch(url).then(x => x.json()).then(data => {
                        _.createDataList(f, data);
                    })
                };

                if (!Core.isValidUrl(f.lookup)) {
                    query = _.getFetchLookup(f);
                }

                this.htmlElement.addEventListener("keyup", e => {
                    query(f._control.htmlElement.value);
                })
            }
        }
    }

    getFetchLookup(f) {
        const _ = this;
        const exo = _.context.exo;

        const o = {
            field: f, type: "lookup", data: f.lookup, callback: (field, data) => {
                _.createDataList.call(_, field, data)
            }
        };

        if (o.data.type === "OpenData") { // TODO enhance
            return (q) => {
                q = q.substr(0, 1).toUpperCase() + q.substr(1);
                let url = o.data.url + "?$top=20&$filter=substring(" + o.data.field + ",0," + q.length + ") eq '" + q + "'";
                fetch(url).then(x => x.json()).then(data => {
                    if (data && data.value) {
                        o.callback(o.field, data.value.map(e => {
                            return e.Title
                        }));
                    }
                })
            }
        }

        return exo.options.get(o)
    }

    createDataList(f, data) {
        const _ = this;
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
                ...el,
            };

            dataList.appendChild(DOM.parseHTML(DOM.format(ExoForm.meta.templates.datalistItem, o)));
        });
        f._control.container.appendChild(dataList);
    }
}

export class ExoTextControl extends ExoInputControl {

    // "exocontainer, default, nolabel, text, group, form, page, navigation, datalist, datalistItem, button"
    containerTemplate = ExoForm.meta.templates.text;

    constructor(context) {
        super(context);

        this.isTextInput = true;
        this.htmlElement = DOM.parseHTML('<input type="text"/>');
    }

    async render() {
        var f = this.context.field;

        if (!this.attributes.placeholder)
            this.attributes.placeholder = " "; // forces caption into text input until focus

        await super.render();

        if (f.mask) {
            DOM.maskInput(this.htmlElement, {
                mask: f.mask,
                format: f.format
            })
        }
        return this.container
    }


}

class ExoFormControl extends ExoElementControl {
    constructor(context) {
        super(context);
        this.htmlElement = DOM.parseHTML('<form />');
    }
}

export class ExoDivControl extends ExoElementControl {

    html = "";

    constructor(context) {
        super(context);
        this.htmlElement = document.createElement('div');

        this.acceptProperties(
            {
                name: "html",
                type: String,
                description: "Inner HTML of the div"
            }
        );
    }

    async render() {

        if (this.html) {
            this.htmlElement.innerHTML = this.html;
        }

        return await super.render()
    }

}

class ExoTextAreaControl extends ExoTextControl {

    //containerTemplate = ExoForm.meta.templates.text;

    autogrow = false;

    constructor(context) {
        super(context);

        this.acceptProperties({
            name: "autogrow",
            type: Boolean,
            description: "Use to automatically expand the typing area as you add lines"
        })


        this.htmlElement = DOM.parseHTML('<textarea/>');
    }

    setProperties() {
        super.setProperties();

        if (this.attributes["value"]) {
            this.htmlElement.innerHTML = this.attributes["value"];
            delete this.attributes["value"];
        }
    }

    async render(){
        await super.render();

        if(this.autogrow){
            this.htmlElement.setAttribute("onInput", "this.parentNode.dataset.replicatedValue = this.value");
            this.htmlElement.parentNode.classList.add("autogrow");
        }

        return this.container;
    }
}

export class ExoListControl extends ExoElementControl {

    containerTemplate = ExoForm.meta.templates.default;

    isMultiSelect = false;

    view = "block";

    constructor(context) {
        super(context);
        this.htmlElement = DOM.parseHTML('<select></select>');

        this.acceptProperties(
            {
                name: "view",
                type: String,
                description: "Set the view mode (list, tiles)"
            }
        );
    }

    async populateList(containerElm, tpl) {
        const _ = this;
        const f = _.context.field;
        if (f.items && Array.isArray(f.items)) {
            let index=0;
            f.items.forEach(i => {
                _.addListItem(f, i, tpl, containerElm, index);
                index++;
            });
        }
    }

    addListItem(f, i, tpl, container, index) {
        const _ = this;

        var dummy = DOM.parseHTML('<span/>')
        container.appendChild(dummy);

        let item = {
            ...i,
            name: i.name || i,
            value: (i.value !== undefined) ? i.value : i,
            type: _.optionType,
            inputname: f.name,
            checked: i.checked ? "checked" : "",
            tooltip: (i.tooltip || i.name || "").replace('{{field}}', ''),
            oid: f.id + "_" + index
        }

        var o = {
            field: f,
            control: _,
            item: item
        };

        if (item.element) {
            o.listElement = item.element;
            DOM.replace(dummy, item.element);
        }
        else if (item.field) { // replace item.name with rendered ExoForm control
            this.renderFieldSync(item, tpl, container);
        }
        else if (item.html) {
            o.listElement = DOM.parseHTML(item.html);
            DOM.replace(dummy, o.listElement);
        }
        else {
            var s = DOM.format(tpl, item);
            o.listElement = DOM.parseHTML(s);
            DOM.replace(dummy, o.listElement);
        }
        _.context.exo.triggerEvent(ExoFormFactory.events.getListItem, o);
    }

    // use trick to run async stuff and wait for it.
    renderFieldSync(item, tpl, container) {
        return (async (item, tpl) => {
            if (item.name.indexOf('{{field}}') === -1) {
                item.tooltip = item.tooltip || item.name;
                item.name = item.name + '{{field}}'
            }

            const exoContext = this.context.exo.context;

            let e = await exoContext.createForm().renderSingleControl(item.field);
            item.name = DOM.format(item.name, {
                field: e.outerHTML
            });
            container.appendChild(DOM.parseHTML(DOM.format(tpl, item)));
        })(item, tpl) //So we defined and immediately called this async function.
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
        const tpl = `<div class="{{class}}" {{required}}>{{inner}}</div>`;
        this.htmlElement = DOM.parseHTML(/*html*/`<select size="1"></select>`);
    }

    async render() {
        let f = this.context.field;
        const tpl = /*html*/`<option class="{{class}}" value="{{value}}">{{name}}</option>`;
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
            class: [
                this.context.field.class || ""
            ].join(' ')
        }))
    }

    async render() {
        let f = this.context.field;
        const tpl = /*html*/`<div class="exf-ilc-cnt" title="{{tooltip}}">
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
                    inp.reportValidity()
                } catch { };

                return false;
            }
        }
        return true;
    }

    // Used to get localized standard validation message 
    getValidationMessage() {
        let msg = "You must select a value",
            testFrm = DOM.parseHTML('<form><input name="test" required /></form');
        testFrm.querySelector("input").addEventListener("invalid", e => {
            msg = e.validationMessage;
            e.preventDefault()
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
    optionType = "radio";

    constructor(context) {
        super(context);
    }
}

class ExoCheckboxListControl extends ExoInputListControl {

    optionType = "checkbox";

    //isMultiSelect = true;
    static returnValueType = Array;

    constructor(context) {
        super(context);
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
        }

        return this.container;
    }


}

class ExoButtonControl extends ExoElementControl {


    constructor(context) {
        super(context);
        this.iconHtml = "";
        this.htmlElement = DOM.parseHTML('<button class="exf-btn" />')

        this.acceptProperties(
            {
                name: "icon",
                description: "Icon class to be used (using a span)"
            },
            {
                name: "click",
                description: "Click method"
            },
            {
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
            _.htmlElement.appendChild(DOM.parseHTML('<span class="' + _.icon + '"></span>'))
            this.htmlElement.appendChild(document.createTextNode(' '));
        }
        
        _.htmlElement.appendChild(DOM.parseHTML(`<span class="exf-caption">${this.context.field.caption}</span>`))

        let elm = await super.render();

        _.htmlElement.addEventListener("click", e => {
            if (_.click) {
                _.context.exo.getFormValues().then(data => {
                    let f = _.click;
                    if (typeof (f) !== "function") {
                        f = _.context.exo.options.customMethods[f];
                    }
                    if (typeof (f) !== "function") {
                        if (_.context.exo.options.host) {
                            if (typeof (_.context.exo.options.host[_.click]) === "function") {
                                f = _.context.exo.options.host[_.click];
                                f.apply(_.context.exo.options.host, [data, e]);
                                return;
                            }
                        }
                        else {
                            throw "Not a valid function: " + _.click
                        }
                    }
                    f.apply(_, [data, e]);
                });

            }
            else if (_.action) {
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
        })

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

export class ExoNumberControl extends ExoInputControl {

    buttons = false;

    constructor(context) {
        super(context);
        this.context.field.type = "number";

        this.acceptProperties({
            name: "buttons",
            description: "Add plus and minus buttons",
            type: Boolean
        })
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


            this.htmlElement.parentNode.insertBefore(this.minusButton, this.htmlElement)
            this.htmlElement.parentNode.insertBefore(this.plusButton, this.htmlElement.nextSibling)

            this.container.classList.add("exf-nmbr-btns");
            this.container.classList.add("exf-std-lbl");

            this.container.addEventListener("click", e => {

                e.cancelBubble = true;
                e.preventDefault();

                if (e.target === this.plusButton) {
                    if (this.htmlElement.max === "" || parseInt(this.htmlElement.value) < parseInt(this.htmlElement.max)) {
                        this.htmlElement.value = parseInt("0" + (this.htmlElement.value || (this.htmlElement.min != "" ? this.htmlElement.min - 1 : -1))) + 1;
                    }
                }
                else if (e.target === this.minusButton) {
                    if (this.htmlElement.min === "" || parseInt(this.htmlElement.value) > parseInt(this.htmlElement.min)) {
                        this.htmlElement.value = parseInt("0" + (this.htmlElement.value || (this.htmlElement.max != "" ? this.htmlElement.max - 1 : 1))) - 1;
                    }
                }

                this.triggerChange();
            })
        }

        return this.container;
    }

    static returnValueType = Number;
}

export class ExoRangeControl extends ExoNumberControl {

    showoutput = false;

    constructor(context) {
        super(context);
        this.context.field.type = "range";

        this.acceptProperties({
            name: "showoutput",
            type: Boolean
        })
    }

    async render() {
        const me = this;
        await super.render();

        if (this.showoutput) {
            this.output = document.createElement("output");
            const sync = e => {
                me.output.value = me.htmlElement.value;
            }

            this.htmlElement.parentNode.insertBefore(this.output, this.htmlElement.nextSibling);
            this.htmlElement.addEventListener("input", sync); sync();
            this.container.classList.add("exf-rng-output")
        }

        // force outside label rendering
        this.container.classList.add("exf-std-lbl");

        return this.container;
    }

    static returnValueType = Number;
}

class ExoProgressControl extends ExoElementControl {

    //containerTemplate = ExoForm.meta.templates.nolabel;
    constructor(context) {
        super(context);
        this.htmlElement = DOM.parseHTML('<progress />');
    }
}

class ExoFormPageControl extends ExoDivControl {
    finalize() { }
}

class ExoFieldSetControl extends ExoFormPageControl {
    constructor(context) {
        super(context);

        this.htmlElement = DOM.parseHTML(DOM.format(ExoForm.meta.templates.fieldset, context.field));

        if (context.field.legend) {
            this.appendChild(
                DOM.parseHTML(DOM.format(ExoForm.meta.templates.legend, {
                    legend: context.field.legend
                }))
            );
        }

        if (context.field.intro) {
            this.appendChild(
                DOM.parseHTML(DOM.format(ExoForm.meta.templates.pageIntro, {
                    intro: context.field.intro
                }))
            );
        }
    }
}


//#endregion

class ExoBaseControls {

    static controls = {

        base: { hidden: true, type: ExoControlBase },
        element: { type: ExoElementControl, note: "Any raw HTML Element", demo: { type: "element", tagName: "img", src: "https://source.unsplash.com/random/600x400" } },
        input: { hidden: true, type: ExoInputControl },
        div: { hidden: true, type: ExoDivControl, note: "A standard HTML div container element", demo: { html: `<h3>Wow!</h3>` } },
        form: { hidden: true, type: ExoFormControl },
        formpage: { hidden: true, type: ExoFormPageControl },
        fieldset: { hidden: true, for: "page", type: ExoFieldSetControl, note: "A fieldset for grouping controls in a form" },
        text: { caption: "Short text", type: ExoTextControl, note: "Standard text input" },
        url: { caption: "Website Address/URL", base: "text", note: "A text input that will accept URLs only" },
        tel: { caption: "Phone number", base: "input", note: "A text input that is used to input phone numbers", demo: { value: "06 23467899" } },
        number: { caption: "Numeric Control", type: ExoNumberControl, note: "A text input that is used to input phone numbers", demo: { min: 1, max: 99 } },
        range: { caption: "Range Slider", type: ExoRangeControl, note: "A range slider input", demo: { min: 1, max: 10, value: 5 } },
        color: { caption: "Color Input", base: "input", note: "A control to select a color", demo: { value: "#cc4433" } },
        checkbox: { base: "input", note: "A checkbox", demo: { checked: true } },
        email: { caption: "Email Address", base: "text", note: "A text input that validates email addresses", demo: { required: true } },
        date: { base: "input", note: "A date input that is used to input phone numbers" },
        month: { base: "input", note: "A month selector input" },
        "datetime-local": { caption: "Local Date &amp; Time selector", base: "input", note: "A date input that is used to input local date/time" },
        search: { base: "text", note: "A search text input with a clear button" },
        password: { base: "text", note: "A text input for password masking" },
        file: { caption: "File upload", base: "text", note: "A standard file upload control" },
        multiline: { caption: "Long text", type: ExoTextAreaControl, alias: "textarea", note: "A multi-line text input" },
        list: { hidden: true, type: ExoListControl },
        dropdown: { type: ExoDropdownListControl, alias: "select", note: "A dropdown list control", demo: { items: ["First", "Second"] } },
        checkboxlist: { caption: "Multiselect List (checkbox)", type: ExoCheckboxListControl, note: "A group of checkboxes to select multiple items", demo: { items: ["First", "Second"] } },
        radiobuttonlist: { caption: "Single select List (radio)", type: ExoRadioButtonListControl, note: "A group of radio buttons to select a single value from", demo: { items: ["First", "Second"] } },
        hidden: { base: "input", note: "A hidden input that is used to store variables" },
        custom: { hidden: true, base: "div", note: "A custom control that is used to render your own ExoFormControl classes" },
        button: { type: ExoButtonControl, note: "A button control", demo: { caption: "Click me" } },
        time: { caption: "Time selector", base: "text", note: "A time input control" },
        progressbar: { type: ExoProgressControl, alias: "progress", note: "A progress indicator control" },
        link: { type: ExoLinkControl, note: "HTML Anchor element" }
    }
}

export default ExoBaseControls;