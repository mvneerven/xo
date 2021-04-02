import ExoBaseControls from './ExoBaseControls';
import ExoForm from './ExoForm';
import Core from '../pwa/Core';
import DOM from '../pwa/DOM';


class ExoFileDropControl extends ExoBaseControls.controls.input.type {

    async render() {
        const _ = this;

        _.field = _.context.field;
        _.field.type = "file";
        _.field.data = this.field.data || [];

        await super.render();

        _.previewDiv = DOM.parseHTML(`<div class="file-preview clearable"></div>`);

        _.container.appendChild(_.previewDiv);
        _.container.classList.add("exf-filedrop");

        _.bind(
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
                    alert(data.error);
                }
            }
        )

        _.field.getCurrentValue = () => {
            return _.field.data.sort();
        }


        return _.container;
    }

    _change() {
        const _ = this;
        DOM.trigger(this.htmlElement, "change", {
            data: _.context.field.data
        })
    }

    bind(cb) {

        const _ = this;

        const loadFile = (data) => {
            var file = data.file;

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
}

class ExoCKRichEditor extends ExoBaseControls.controls.div.type {
    constructor(context) {
        super(context);

        this.htmlElement.data = {};
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

                        _.context.field.getCurrentValue = () => {
                            return _.htmlElement.data.editor.getData();
                        }

                    });
                resolve(_.container);
            });

        })
    }
}

class ExoSwitchControl extends ExoBaseControls.controls.range.type {

    containerTemplate = ExoForm.meta.templates.labelcontained;

    static returnValueType = Boolean;

    constructor(context) {
        super(context);
    }

    setProperties() {
        this.context.field.min = 0;
        this.context.field.max = 1;
        this.context.field.containerClass = "exf-switch";
        this.context.field.value = this.context.field.value || 0;
        super.setProperties();

        this.context.field.type = "switch"
    }

    async render() {
        const _ = this;
        let e = await super.render();

        const check = e => {
            
            let sw = e.target.closest(".exf-switch");
            let range = sw.querySelector("[type='range']");
            sw.classList[range.value === "1" ? "add" : "remove"]("on");
            //DOM.trigger(range, "change")

            _.triggerChange()
        };

        check({ target: e });

        // e.addEventListener("change", e=>{
        //     e.stopImmediatePropagation();
        //     e.cancelBubble = true;
        //     e.preventDefault();
        //     e.stopPropagation();
        //     e.returnValue = false;
        //     check(e)
        // });

        if (this.context.field.disabled)
            this.enabled = false;

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
        return e;
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

        this.acceptProperties("max", "duplicate", "tags")
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
        _.container.insertBefore(_.wrapper, _.htmlElement);

        _.context.field.getCurrentValue = () => {
            return _.arr;
        }

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

        return _.container;
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
            console.log('Max tags limit reached');
            return true;
        }

        if (!this.duplicate && this.arr.indexOf(string) != -1) {
            console.log('duplicate found " ' + string + ' " ')
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

class ExoTabStripControl extends ExoBaseControls.controls.div.type {
    constructor(context) {
        super(context);

        let name = this.context.field.name || "tabStrip";

        let tabs = {}

        this.context.field.pages.forEach(p => {
            tabs[p.id] = { caption: p.caption }
        })

        this.tabStrip = new ULTabStrip(name, {
            tabs: tabs
        });
    }

    finalize(container) {
        let index = 0;
        let ar = container.querySelectorAll(".exf-page")

        for (var t in this.tabStrip.tabs) {
            this.tabStrip.tabs[t].replaceWith(ar[index]);
            index++;
        }
    }

    async render() {
        await super.render();

        let elm = await this.tabStrip.render();
        elm.classList.add("exf-tabs-wrapper")
        return elm;
    }


}

class ExoCaptchaControl extends ExoBaseControls.controls.div.type {

    constructor(context) {
        super(context);

        DOM.require("https://www.google.com/recaptcha/api.js");

        this.acceptProperties("sitekey")
    }

    async render() {

        this.htmlElement.classList.add("g-recaptcha");

        this.htmlElement.setAttribute("data-sitekey", this.sitekey)

        return this.htmlElement
    }

    set sitekey(value) {
        this._sitekey = value;
    }

    get sitekey() {
        return this._sitekey;
    }
}

// TODO finish
class DropDownButton extends ExoBaseControls.controls.list.type {

    containerTemplate = ExoForm.meta.templates.nolabel;

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

class ExoVideoControl extends ExoBaseControls.controls.list.type {

    width = 600;

    height = 400

    mute = false;

    autoplay = true;

    player = "youtube";

    tooltip = "YouTube video player";

    id = "abcdefghij";

    static players = {
        youtube: {
            template: /*html*/`<iframe width="{{width}}" height="{{height}}" src="https://www.youtube.com/embed/{{id}}?autoplay={{autoplay}}&mute={{mute}}" title="{{tooltip}}" 
                frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
        },
        vimeo: {
            template: /*html*/`<iframe src="https://player.vimeo.com/video/{{id}}?title=0&byline=0&portrait=0&background={{mute}}" title="{{tooltip}}"
                width="{{width}}" height="{{height}}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`
        }

    }

    constructor(context) {
        super(context);

        this.acceptProperties("width", "height", "autoplay", "mute", "id", "tooltip", "player")
    }

    async render() {

        const player = ExoVideoControl.players[this.player];

        if (!player)
            throw "Unrecognized player";

        this.htmlElement = DOM.parseHTML(DOM.format(player.template, this));

        return this.htmlElement;

    }
}

class MultiInputControl extends ExoBaseControls.controls.div.type {

    grid = "exf-cols-50-50";

    constructor(context) {
        super(context);

        this.acceptProperties("grid-template", "grid");
    }

    async render() {

        const _ = this;
        const f = _.context.field;
        this.htmlElement.classList.add("exf-cnt", "exf-ctl-group", this.grid)

        if (this["grid-template"]) {
            this.htmlElement.setAttribute("style", 'grid-template: ' + this["grid-template"]);
        }

        _._qs = (name) => {
            return this.htmlElement.querySelector('[name="' + f.name + "_" + name + '"]')
        }

        const rs = async (name, options) => {
            return _.context.exo.renderSingleControl({
                name: f.name + "_" + name,
                ...options
            })
        }

        _.inputs = {}

        const add = async (n, options) => {
            _.inputs[n] = await rs(n, options);
            _.htmlElement.appendChild(_.inputs[n])
        }

        for (var n in this.fields) {
            await add(n, this.fields[n])
        };

        _._gc = e => {
            let data = {}
            for (var n in _.fields) {
                data[n] = _._qs(n).value;
            }
            return data
        }

        this.context.field.getCurrentValue = _._gc;

        return _.htmlElement;
    }
}

class ExoNameControl extends MultiInputControl {

    grid = "exf-cols-10em-1fr";

    fields = {
        first: { caption: "First", type: "text", maxlength: 30, required: true, placeholder: "" },
        last: { caption: "Last", type: "text", maxlength: 50, required: true, placeholder: "" },
    }
}

class ExoNLAddressControl extends MultiInputControl {

    grid = "exf-cols-10em-1fr";

    ["grid-template"] = '"a b c"\n"a b b"';

    // https://github.com/PDOK/locatieserver/wiki/API-Locatieserver
    static APIUrl = "https://geodata.nationaalgeoregister.nl/locatieserver/v3/free?q=postcode:{{code}}&huisnummer:{{nr}}";

    fields = {
        code: { caption: "Postcode", type: "text", size: 7, maxlength: 7, required: true, pattern: "[1-9][0-9]{3}\s?[a-zA-Z]{2}", placeholder: "" },
        nr: { caption: "Huisnummer", type: "number", size: 6, maxlength: 6, placeholder: "" },
        ext: { caption: "Toevoeging", type: "text", size: 3, maxlength: 3, placeholder: "" },
        city: { caption: "Plaats", type: "text", maxlength: 50, readonly: true, placeholder: "" },
        street: { caption: "Straatnaam", type: "text", maxlength: 50, readonly: true, placeholder: "" }
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
                        _._qs("street").value = d.straatnaam_verkort;
                        _._qs("city").value = d.woonplaatsnaam;
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

    grid = "exf-cols-50-50";

    fields = {
        name: { caption: "Name on Card", type: "text", maxlength: 50, required: true, placeholder: "" },
        number: { caption: "Credit Card Number", type: "text", size: 16, required: true, maxlength: 16, placeholder: "", pattern: "[0-9]{13,16}", },
        expiry: { caption: "Card Expires", containerClass: "exf-label-sup", type: "month", required: true, maxlength: 3, placeholder: "", min: (new Date().getFullYear() + "-" + ('0' + (new Date().getMonth() + 1)).slice(-2)) },
        cvv: { caption: "CVV", type: "number", required: true, minlength: 3, maxlength: 3, size: 3, placeholder: "", min: "000" }
    }
}

class ExoDateRangeControl extends MultiInputControl {
    grid = "exf-cols-10em-10em";

    fields = {
        from: { caption: "From", type: "date", required: true },
        to: { caption: "To", type: "date", required: true }
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

    confirmText = "OK";

    cancelText = "Cancel";

    cancelVisible = false;

    body = "The dialog body";

    modal  = false;

    dlgTemplate = /*html*/`<div class="exf-dlg" role="dialog" id="{{dlgId}}">
<div class="exf-dlg-c">
    <div class="exf-dlg-h">
        <div class="exf-dlg-t">{{title}}<button type="button" class="dlg-bc dlg-x dismiss" ><span>&times;</span></button></div>
    </div>
<div class="exf-dlg-b">{{body}}</div>
<div class="exf-dlg-f">
    <button type="button" class="dlg-x btn btn-default dismiss" >{{cancelText}}</button>
    <button type="button" class="dlg-x btn btn-primary confirm" >{{confirmText}}</button>
</div>
</div>
</div>`;

    constructor(context) {
        super(context);
        this.acceptProperties("title", "cancelText", "body", "confirmText", "cancelVisible", "modal");
        this.dlgId = 'dlg_' + Core.guid().replace('-','');
    }

    hide(){

    }

    show() {
        const _ = this;      

        let html = DOM.format(_.dlgTemplate, {...this})

        let dlg = DOM.parseHTML(html);

        dlg.classList.add(this.cancelVisible ? "dlg-cv" : "dlg-ch");

        const c = (e, confirm) => {
            _.remove();
            //window.location.hash = "na";
            var btn = "cancel", b = e.target;
            if (confirm || b.classList.contains("confirm")) {
                btn = "confirm";
            }
            _.hide.apply(_, [btn]);
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

    remove(){
        let dlg = document.querySelector("#" + this.dlgId);
        if(dlg)
            dlg.remove();
    }
}

class ExoExtendedControls {
    static controls = {
        filedrop: {
            type: ExoFileDropControl, alias: "file", note: "An input for file uploading", demo: {
                drop: {
                    height: "100px"
                },
                max: 1, "fileTypes": ["image/"],
                maxSize: 4096000,
                caption: "Select your profile image",
                containerClass: "image-upload"
            }
        },
        switch: { type: ExoSwitchControl },
        richtext: { type: ExoCKRichEditor, note: "A CKEditor wrapper for ExoForm" },
        tags: { caption: "Tags control", type: ExoTaggingControl, note: "A control for adding multiple tags", demo: { tags: ["JavaScript", "CSS", "HTML"] } },
        creditcard: { caption: "Credit Card", type: ExoCreditCardControl, note: "A credit card control" },
        name: { caption: "Name (first, last) group", type: ExoNameControl, note: "Person name controk" },
        nladdress: { caption: "Dutch address", type: ExoNLAddressControl, note: "Nederlands adres" },
        tabstrip: { for: "page", type: ExoTabStripControl, note: "A tabstrip control for grouping controls in a form" },
        daterange: { caption: "Date range", type: ExoDateRangeControl, note: "A date range control" },
        video: { type: ExoVideoControl, caption: "Embed video", note: "An embedded video from YouTube or Vimeo", demo: { player: "youtube", id: "85Nyi4Xb9PY" } },
        dropdownbutton: { hidden: true, type: DropDownButton, note: "A dropdown menu button" },
        captcha: { caption: "Google ReCaptcha Control", type: ExoCaptchaControl, note: "Captcha field", demo: { sitekey: "6Lel4Z4UAAAAAOa8LO1Q9mqKRUiMYl_00o5mXJrR" } },
        dialog: { type: ExoDialogControl, caption: "Dialog", note: "A simple dialog (modal or modeless)" }
    }
}



export default ExoExtendedControls;