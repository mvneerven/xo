import ExoBaseControls from './ExoBaseControls';
import ExoFormFactory from './ExoFormFactory';
import ExoForm from './ExoForm';
import Core from '../pwa/Core';
import DOM from '../pwa/DOM';


class ExoFileDropControl extends ExoBaseControls.controls.input.type {

    height = 120;

    constructor(context) {
        super(context);

        this.acceptProperties(
            { name: "maxSize" },
            { name: "max", type: Number, description: "Max number of files accepted" },
            { name: "fileTypes", type: String | Array, description: 'Array of strings - example: ["image/"]' },
            { name: "maxSize", type: Number, description: "Maximum filesize of files to be uploaded (in bytes) - example: 4096000" },
            { name: "height", type: Number, description: "Height of drop area" }
        )
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

        _.bindEvents(
            data => {
                if (!data.error) {
                    var thumb = DOM.parseHTML('<div data-id="' + data.fileName + '" class="thumb ' + data.type.replace('/', ' ') + '"></div>');

                    let close = DOM.parseHTML('<button title="Remove" type="button" class="close">x</button>');
                    close.addEventListener("click", e => {

                        let thumb = e.target.closest(".thumb");
                        let id = thumb.getAttribute("data-id");
                        var index = Array.from(_.previewDiv.children).indexOf(thumb);
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
                    }
                    else {
                        thumb.classList.add("no-img");
                    }
                    thumb.appendChild(img);
                    thumb.appendChild(DOM.parseHTML('<figcaption>' + data.fileName + '</figcaption>'));
                    _.previewDiv.appendChild(thumb);
                }
                else {
                    _.showHelp(data.error, { type: "error" });
                }
            }
        )
        return _.container;
    }

    get value() {
        return this.context.field.data.sort();
    }

    set value(data) {
        // TODO 
    }


    _change() {
        DOM.trigger(this.htmlElement, "change", {
            data: this.context.field.data
        })
    }

    bindEvents(cb) {

        const _ = this;

        const loadFile = (data) => {
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
                }
                if (_.field.max) {
                    if (_.field.data.length >= _.field.max) {
                        returnValue.error = "Maximum number of attachements reached";
                    }
                }

                if (_.field.fileTypes) {
                    let found = false;
                    _.field.fileTypes.forEach(t => {
                        if (data.file.type.indexOf(t) === 0)
                            found = true;
                    })

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
            } catch { }

        }

        const dropArea = _.htmlElement.closest(".exf-ctl-cnt");

        const uf = (e) => {

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
                    })
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
    }
}

class ExoCKRichEditor extends ExoBaseControls.controls.div.type {
    constructor(context) {
        super(context);

        this.htmlElement.data = {};

    }

    get value() {
        return this.htmlElement.data.editor.getData();
    }

    set value(data) {
        this.htmlElement.data.editor.setData(data);
    }

    async render() {
        const _ = this;

        await super.render();
        const me = _.htmlElement;
        return new Promise((resolve, reject) => {
            DOM.require("https://cdn.ckeditor.com/ckeditor5/17.0.0/classic/ckeditor.js", () => {
                ClassicEditor
                    .create(_.htmlElement)
                    .catch(error => {
                        console.error(error);
                    }).then(ck => {
                        _.htmlElement.data["editor"] = ck;

                    });
                resolve(_.container);
            });

        })
    }
}

class ExoSwitchControl extends ExoBaseControls.controls.range.type {

    static returnValueType = Boolean;

    setProperties() {
        this.context.field.min = 0;
        this.context.field.max = 1;
        this.context.field.value = this.context.field.value || 0;
        super.setProperties();

        this.context.field.type = "switch"
    }

    async render() {
        const _ = this;
        let e = await super.render();

        this.container.classList.add("exf-switch");
        // force outside label rendering
        this.container.classList.add("exf-std-lbl");

        const check = e => {

            let sw = e.target.closest(".exf-switch");
            let range = sw.querySelector("[type='range']");
            sw.classList[range.value === "1" ? "add" : "remove"]("on");
            _.triggerChange()
        };

        check({ target: e });

        // if (this.context.field.disabled)
        //     this.enabled = false;

        e.addEventListener("click", e => {
            e.stopImmediatePropagation();
            e.cancelBubble = true;
            e.preventDefault();
            e.stopPropagation();
            e.returnValue = false;

            let range = e.target.closest(".exf-switch").querySelector("[type='range']");
            if (e.target.tagName != "INPUT") {

                range.value = range.value == "0" ? 1 : 0;
                check({ target: range });
            }
            check({ target: range });
        })

        return this.container;
        //return e;
    }
}

class ExoTaggingControl extends ExoBaseControls.controls.text.type {

    max = null;

    duplicate = false;

    wrapperClass = 'exf-tags-input';

    tagClass = 'tag';

    // Initialize elements
    arr = [];

    constructor(context) {
        super(context)

        this.acceptProperties(
            {
                name: "max",
                type: Number,
                description: "Maximum number of tags allowed"
            },
            {
                name: "duplicate",
                type: Boolean,
                description: "Allow duplicates. Default false"
            },
            {
                name: "tags",
                description: "Tag names to set (array)"
            })
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

        })

        _.wrapper.append(_.input);
        _.wrapper.classList.add(_.wrapperClass);
        _.htmlElement.parentNode.insertBefore(_.wrapper, _.htmlElement);

        _.wrapper.addEventListener('click', function () {
            _.input.focus();
        });

        _.input.addEventListener('keydown', e => {
            var str = _.input.value.trim();
            if (!!(~[9, 13, 188].indexOf(e.keyCode))) {
                e.preventDefault();
                e.stopPropagation();
                e.returnValue = false;

                _.input.value = "";
                if (str !== "") {
                    _.addTag(str);
                }
            }
            else if (e.key === 'Backspace') {
                if (_.input.value === "") {
                    let tags = _.wrapper.querySelectorAll(".tag")
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
            })
        }

        _.container.classList.add("exf-std-lbl");

        return _.container;
    }

    get value() {
        return this.arr;
    }

    // Add Tag
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
                if (_.wrapper.childNodes[i] == tag)
                    _.deleteTag(tag, i);
            }
        });

        tag.appendChild(closeIcon);
        _.wrapper.insertBefore(tag, _.input);
        _.triggerChange();
        return _;
    }

    // Delete Tag
    deleteTag(tag, i) {
        tag.remove();
        this.arr.splice(i, 1);
        this.triggerChange()
        return this;
    }

    // override ExoControlBase.triggerChange - dispatch event on htmlElement fails 
    // for some reason - disspatching on visual tag input
    triggerChange() {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", true, true);
        evt.detail = { field: "tags" };
        this.input.dispatchEvent(evt);
    }

    // Errors
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
        })
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
        },
            {
                name: "invisible",
                type: Boolean,
                description: "Use invisible Captcha method",
                more: "https://developers.google.com/recaptcha/docs/invisible"
            }
        )
    }

    async render() {

        this.htmlElement.classList.add("g-recaptcha");

        this.htmlElement.setAttribute("data-sitekey", this.sitekey)

        if (this.invisible) {
            this.htmlElement.setAttribute("data-size", "invisible");
        }

        return this.htmlElement
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
        this._invisible = (value == true);
    }
}

// TODO finish
class DropDownButton extends ExoBaseControls.controls.list.type {

    navTemplate = /*html*/`
        <nav class="ul-drop" role='navigation'>
            <ul>
                <li>
                    <a class="user-icon" href="#"><span class="ti-user"></span></a>
                    <ul></ul>
                </li>
            </ul>
        </nav>`;

    constructor(context) {
        super(context);
        this.context.field.type = "hidden";
        this.htmlElement = DOM.parseHTML(this.navTemplate);
    }

    async render() {
        let f = this.context.field;
        const tpl = /*html*/`<li title="{{tooltip}}"><a class="{{class}}" href="{{value}}">{{name}}</a></li>`;
        await this.populateList(this.htmlElement.querySelector("ul > li > ul"), tpl);
        return await super.render();
    }

    setupButton() {
        const _ = this;
        document.querySelector("body").classList.add("signed-out");
        container.appendChild(DOM.parseHTML(DOM.format(tpl, data, { empty: undefined })));
    }
}

class ExoEmbedControl extends ExoBaseControls.controls.element.type {
    width = 600;
    height = 400;

    constructor(context) {
        super(context);

        this.acceptProperties(
            { name: "url", description: "Url of the page to embed" },
            { name: "width" },
            { name: "height" }
        )

        this.htmlElement = document.createElement("iframe");
    }

    async render() {


        this.htmlElement.setAttribute("src", this.url);
        this.htmlElement.setAttribute("frameborder", "0");
        this.htmlElement.setAttribute("allowfullscreen", "true");
        this.htmlElement.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture");

        await super.render();

        let wrapper = document.createElement("div")
        wrapper.classList.add("exf-embed-container");
        wrapper.appendChild(this.htmlElement);
        this.container.querySelector(".exf-ctl").appendChild(wrapper);

        this.container.classList.add("exf-base-embed");

        return this.container
    }
}

class ExoVideoControl extends ExoEmbedControl {

    mute = false;

    autoplay = true;

    player = "youtube";

    code = "abcdefghij";

    static players = {
        youtube: {
            url: "https://www.youtube.com/embed/{{code}}?autoplay={{autoplay}}&mute={{mute}}"

        },
        vimeo: {
            url: "https://player.vimeo.com/video/{{code}}?title=0&byline=0&portrait=0&background={{mute}}"
        }
    }

    constructor(context) {
        super(context);

        this.acceptProperties(
            { name: "code", description: "Code of the video to embed" },
            { name: "width" },
            { name: "height" },
            { name: "autoplay", type: Boolean, description: "Boolean indicating whether the video should immediately start playing" },
            { name: "mute", type: Boolean, description: "Boolean indicating whether the video should be muted" },
            { name: "player", type: String, description: "Player type. Currently implemented: youtube, vimeo" }
        )
    }

    async render() {
        const player = ExoVideoControl.players[this.player];

        this.url = DOM.format(player.url, this);
        await super.render();
        return this.container;
    }
}

class MultiInputControl extends ExoBaseControls.controls.div.type {
    columns = ""

    areas = "";

    gap = "1rem";

    static returnValueType = Object;

    constructor(context) {
        super(context);

        this.acceptProperties(
            {
                name: "grid-template",
                description: "CSS3 grid template",
                more: "https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template"
            },

            {
                name: "areas",
                description: "Grid template areas to set up on the containing div",
                example: `"field1 field1 field2"
                "field3 field4 field4"`
            },
            {
                name: "columns",
                description: "Grid columns to set up on containing div",
                example: "10em 10em 1fr"
            },
            {
                name: "gap",
                description: "Grid gap to set up on containing div",
                example: "16px"
            },
            {
                name: "fields", type: Object,
                description: "Fields structure",
                example: {
                    first: { caption: "First", type: "text", maxlength: 30 },
                    last: { caption: "Last", type: "text", maxlength: 50 }
                }
            }

        );
    }

    async render() {

        await super.render();

        const _ = this;
        const f = _.context.field;
        const exo = _.context.exo;

        this.htmlElement.classList.add("exf-cnt", "exf-ctl-group")

        if ((this.areas && this.columns) || this["grid-template"] || this.grid) {
            this.htmlElement.classList.add("grid");
        }

        if (this.areas && this.columns) {

            this.htmlElement.setAttribute("style", `display: grid; grid-template-areas: ${this.areas}; grid-template-columns: ${this.columns}; grid-gap: ${this.gap}`);
        }
        else {
            if (this["grid-template"]) {
                this.htmlElement.setAttribute("style", `display: grid; grid-template: ${this["grid-template"]}`);
            }
            else if (this.grid) {
                this.htmlElement.classList.add(this.grid)
            }
        }


        const rs = async (name, options) => {
            return _.context.exo.renderSingleControl(options)
        }

        _.inputs = {}

        const add = async (n, options) => {

            options = {
                ...options,
                name: f.name + "_" + n
            }

            for (var o in options) {
                var v = options[o];
                if (v === "inherit")
                    options[o] = f[o]
            }


            _.inputs[n] = await rs(n, options);
            _.inputs[n].setAttribute("data-multi-name", options.name);
            _.htmlElement.appendChild(_.inputs[n])
            return _.inputs[n];
        }


        if (!this.fields && f.fields) {
            this.fields = f.fields;
        }

        for (var n in this.fields) {
            var elm = await add(n, this.fields[n])

            if (this.areas)
                elm.setAttribute("style", `grid-area: ${n}`);
        };

        // inform system that this is the master control 
        // See: ExoFormFactory.getFieldFromElement(... , {master: true})
        this.htmlElement.setAttribute("exf-data-master", "multiinput");
        return this.container;

    }

    _qs(name) {
        const f = this.context.field;
        if (this.htmlElement) {
            return this.htmlElement.querySelector('[data-multi-name="' + f.name + "_" + name + '"]')
        }
        return "";
    }

    get value() {

        let data = this.context.field.value || {};

        for (var n in this.fields) {
            var elm = this._qs(n);
            if (elm) {
                let fld = ExoFormFactory.getFieldFromElement(elm);
                data[n] = fld._control.value;
            }
        }
        return data
    }

    set value(data) {
        data = data || {};
        this.context.field.value = data
        for (var n in this.fields) {
            data[n] = data[n] || "";
            this.fields[n].value = data[n];
            var elm = this._qs(n);
            if (elm) {
                let fld = ExoFormFactory.getFieldFromElement(elm);
                fld._control.value = data[n];
            }
        }
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
            console.log("Checking ", elm)
            if (!elm.checkValidity()) {
                console.log("Not valid: ", elm)
                if (elm.reportValidity)
                    elm.reportValidity();

                return false;
            }
        }
        return true;
    }

    getFormElement(elm) {
        if (elm.name && elm.form)
            return elm;

        return elm.querySelector("[name]") || elm;
    }

}

class ExoNameControl extends MultiInputControl {

    columns = "10em 1fr";

    areas = `"first last"`;

    fields = {
        first: { caption: "First", type: "text", maxlength: 30, required: "inherit" },
        last: { caption: "Last", type: "text", maxlength: 50, required: "inherit" }
    }

}

class ExoNLAddressControl extends MultiInputControl {

    columns = "4em 4em 10em 1fr"

    areas = `
        "code code nr fill"
        "ext ext city city"
        "street street street street"`;


    // https://github.com/PDOK/locatieserver/wiki/API-Locatieserver
    static APIUrl = "https://geodata.nationaalgeoregister.nl/locatieserver/v3/free?q=postcode:{{code}}&huisnummer:{{nr}}";

    fields = {
        code: { caption: "Postcode", type: "text", size: 7, maxlength: 7, required: "inherit", pattern: "[1-9][0-9]{3}\s?[a-zA-Z]{2}", placeholder: "1234AB" },
        nr: { caption: "Huisnummer", type: "number", size: 6, maxlength: 6, required: "inherit", placeholder: "67" },
        ext: { caption: "Toevoeging", type: "text", size: 3, maxlength: 3, placeholder: "F" },
        city: { caption: "Plaats", type: "text", maxlength: 50, readonly: true, placeholder: "Den Helder" },
        street: { caption: "Straatnaam", type: "text", maxlength: 50, readonly: true, placeholder: "Dorpstraat" }
    }

    async render() {
        const _ = this;

        let element = await super.render();

        const check = () => {
            var data = this.value;

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
        }

        _.inputs["nr"].addEventListener("change", check)
        _.inputs["code"].addEventListener("change", check)
        _.inputs["ext"].addEventListener("change", check)

        return element;
    }

}

class ExoCreditCardControl extends MultiInputControl {

    columns = "4em 4em 4em 1fr";

    areas = `
        "name name number number"
        "expiry expiry cvv fill"`;


    fields = {
        name: { caption: "Name on Card", type: "text", maxlength: 50, required: "inherit", placeholder: "" },
        number: { caption: "Credit Card Number", type: "text", size: 16, required: "inherit", maxlength: 16, placeholder: "", pattern: "[0-9]{13,16}", },
        expiry: { caption: "Card Expires", class: "exf-label-sup", type: "month", required: "inherit", maxlength: 3, placeholder: "", min: (new Date().getFullYear() + "-" + ('0' + (new Date().getMonth() + 1)).slice(-2)) },
        cvv: { caption: "CVV", type: "number", required: "inherit", minlength: 3, maxlength: 3, size: 3, placeholder: "", min: "000" }
    }
}

class ExoDateRangeControl extends MultiInputControl {
    grid = "exf-cols-10em-10em";

    fields = {
        from: { caption: "From", type: "date" },
        to: { caption: "To", type: "date" }
    }


    async render() {
        const _ = this;

        let element = await super.render();

        let _from = _.inputs.from.querySelector("[name]")
        let _to = _.inputs.to.querySelector("[name]");

        const check = e => {

            if (e.target === _from) {
                _to.setAttribute("min", _from.value)
            }
            else if (e.target === _to) {
                _from.setAttribute("max", _to.value)
            }

        }

        _from.addEventListener("change", check)
        _to.addEventListener("change", check)

        return element;
    }

}

class ExoDialogControl extends ExoBaseControls.controls.div.type {

    title = "Dialog";

    _visible = false;

    confirmText = "OK";

    cancelText = "Cancel";

    cancelVisible = false;

    body = "The dialog body";

    modal = false;

    dlgTemplate = /*html*/`<div class="exf-dlg" role="dialog" id="{{dlgId}}">
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
</div>`;

    constructor(context) {
        super(context);
        this.acceptProperties("title", "cancelText", "body", "confirmText", "cancelVisible", "modal");
        this.dlgId = 'dlg_' + Core.guid().replace('-', '');
    }

    hide(button, e) {
        if (this.context.field.click) {
            this.context.field.click.apply(this, [button, e])
        }
    }

    set visible(value) {
        this._visible = value;

        if (this.rendered) {
            if (value) {
                this.show()
            }
            else {
                this.hide();
            }
        }
    }

    show() {
        const _ = this;

        let html = DOM.format(_.dlgTemplate, { ...this })

        let dlg = DOM.parseHTML(html);

        dlg.classList.add(this.cancelVisible ? "dlg-cv" : "dlg-ch");

        const c = (e, confirm) => {

            //window.location.hash = "na";
            var btn = "cancel", b = e.target;
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

        if (!this.modal)
            setTimeout(() => {
                document.body.addEventListener("click", c, {
                    once: true
                })
            }, 10)
    }

    remove() {
        let dlg = document.querySelector("#" + this.dlgId);
        if (dlg)
            dlg.remove();
    }
}

class ExoInfoControl extends ExoBaseControls.controls.div.type {

    template = `<section class="exf-info {{class}}">
    <div class="exf-info-title"><span class="exf-info-icon {{icon}}"></span><span class="exf-info-title-text">{{title}}</span></div>
    <div class="exf-info-body">{{body}}</div>
    </section>`

    title = ""

    body = "";

    icon = "ti-info";

    constructor(context) {
        super(context);
        this.acceptProperties("title", "icon", "body", "class");
    }

    async render() {
        const _ = this;

        let html = DOM.format(_.template, { ...this })

        _.htmlElement.appendChild(DOM.parseHTML(DOM.format(_.template, this)));


        return _.htmlElement;
    }
}

class ExoStarRatingControl extends ExoBaseControls.controls.range.type {

    svg = /*html*/`<svg>
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
  </svg>`

    static returnValueType = Number;

    async render() {
        let e = await super.render();

        let wrapper = document.createElement('div');
        e.appendChild(wrapper);

        let input = e.querySelector("[type=range]");
        input.setAttribute("min", "0");
        input.setAttribute("max", "5");
        input.setAttribute("step", "any");

        wrapper.appendChild(input)

        e.insertBefore(DOM.parseHTML(this.svg), wrapper);

        e.classList.add("exf-star-rating-cnt")
        wrapper.classList.add("exf-star-rating")


        throw "Not implemented";

        return e;
    }

}

class ExoExtendedControls {
    static controls = {
        filedrop: {
            type: ExoFileDropControl, alias: "file", note: "An input for file uploading", demo: {
                max: 1, "fileTypes": ["image/"],
                maxSize: 4096000,
                caption: "Select your profile image",
                class: "image-upload"
            }
        },
        switch: { type: ExoSwitchControl },
        richtext: { type: ExoCKRichEditor, note: "A CKEditor wrapper for ExoForm" },
        tags: { caption: "Tags control", type: ExoTaggingControl, note: "A control for adding multiple tags", demo: { tags: ["JavaScript", "CSS", "HTML"] } },
        multiinput: { type: MultiInputControl },
        creditcard: { caption: "Credit Card", type: ExoCreditCardControl, note: "A credit card control" },
        name: { caption: "Name (first, last) group", type: ExoNameControl, note: "Person name control" },
        nladdress: { caption: "Dutch address", type: ExoNLAddressControl, note: "Nederlands adres" },
        //tabstrip: { for: "page", type: ExoTabStripControl, note: "A tabstrip control for grouping controls in a form" },
        daterange: { caption: "Date range", type: ExoDateRangeControl, note: "A date range control" },
        embed: { type: ExoEmbedControl, note: "Embed anything in an IFrame", demo: { url: "https://codepen.io/chriscoyier/embed/gfdDu" } },
        video: { type: ExoVideoControl, caption: "Embed video", note: "An embedded video from YouTube or Vimeo", demo: { player: "youtube", code: "85Nyi4Xb9PY" } },
        dropdownbutton: { hidden: true, type: DropDownButton, note: "A dropdown menu button" },
        captcha: { caption: "Google ReCaptcha Control", type: ExoCaptchaControl, note: "Captcha field", demo: { sitekey: "6Lel4Z4UAAAAAOa8LO1Q9mqKRUiMYl_00o5mXJrR" } },
        starrating: { type: ExoStarRatingControl, note: "An accessible star rating control", demo: { value: 2.5 } },
        dialog: { type: ExoDialogControl, caption: "Dialog", note: "A simple dialog (modal or modeless)" },
        info: { type: ExoInfoControl, note: "An info panel", demo: { title: "Info", icon: "ti-info", body: "Your informational text" } }

    }
}

export default ExoExtendedControls;