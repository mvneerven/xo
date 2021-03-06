import ExoBaseControls from '../base';
import DOM from '../../../pwa/DOM';

class ExoFileDropControl extends ExoBaseControls.controls.input.type {

    height = 120;
    _value = [];

    constructor() {
        super(...arguments);
        this.field = this.context.field;
        
        this.acceptProperties(
            { name: "max", type: Number, description: "Max number of files accepted" },
            { name: "fileTypes", type: Array, description: 'Array of strings - example: ["image/"]' },
            { name: "maxSize", type: Number, description: "Maximum filesize of files to be uploaded (in bytes) - example: 4096000" },
            { name: "height", type: Number, description: "Height of drop area" }
        )

        if (Array.isArray(this.field.data))
            this._value = this.field.data;
    }

    async render() {


        this.htmlElement.setAttribute("type", "file")

        if (this.max > 1) {
            this.htmlElement.setAttribute("multiple", "multiple")
        }

        await super.render();

        this.previewDiv = DOM.parseHTML(`<div class="file-preview clearable"></div>`);
        this.previewDiv.style.height = `${this.height}px`;

        this.container.querySelector(".exf-inp").appendChild(this.previewDiv);
        this.container.classList.add("exf-filedrop", "exf-std-lbl");
        

        this.bindEvents(
            data => {
                this.stopLoading();

                if (!data.error) {
                    var thumb = DOM.parseHTML('<div data-id="' + data.fileName + '" class="thumb ' + data.type.replace('/', ' ') + '"></div>');

                    let close = DOM.parseHTML('<button title="Remove" type="button" class="close">x</button>');
                    close.addEventListener("click", e => {

                        let thumb = e.target.closest(".thumb");
                        let id = thumb.getAttribute("data-id");
                        var index = Array.from(this.previewDiv.children).indexOf(thumb);
                        thumb.remove();
                        this._value = this._value.filter(item => item.fileName !== id);
                        this._change();
                    });
                    thumb.appendChild(close);

                    thumb.setAttribute("title", data.fileName);
                    let img = DOM.parseHTML('<div class="thumb-data"></div>');
                    if (data.type.startsWith("image/")) {
                        thumb.classList.add("image");
                        img.style.backgroundImage = 'url("' + this.getDataUrl(data.b64, data.type) + '")';
                    }
                    else {
                        thumb.classList.add("no-img");
                    }
                    thumb.appendChild(img);
                    thumb.appendChild(DOM.parseHTML('<figcaption>' + data.fileName + '</figcaption>'));
                    this.previewDiv.appendChild(thumb);
                }
                else {
                    this.showHelp(data.error, { type: "error" });
                }
            }
        )
        return this.container;
    }

    get baseType(){
        return "file"
    }

    stopLoading() {
        setTimeout(() => {
            this.container.classList.remove("loading");
        }, 500);
    }

    get value() {
        return this._value.sort();
    }

    set value(data) {
        // TODO 
    }

    _change() {
        console.debug("ExoFileDropControl", "Firing change event");
        var evt = new Event("change", {bubbles: true, cancelable: true})
        evt.detail = {
            field: "filedrop",
            data: this.value
        };
        this.htmlElement.dispatchEvent(evt);
        this.stopLoading()
    }

    clear() {
        this._value = [];

        if (this.rendered)
            this.container.querySelector(".clearable").innerHTML = "";
    }

    bindEvents(cb) {
        const me = this;
        const loadFile = (data) => {
            var file = data.file;
            this.showHelp();
            var reader = new FileReader();
            reader.onload = function () {

                let returnValue = {
                    error: "",
                    fileName: data.file.name,
                    type: data.file.type,
                    size: data.file.size,
                    date: data.file.lastModifiedDate?.toISOString()
                }
                if (me.field.max) {
                    if (me._value.length >= me.field.max) {
                        returnValue.error = "Maximum number of attachements reached";
                    }
                }

                if (me.field.fileTypes) {
                    let found = false;
                    me.field.fileTypes.forEach(t => {
                        if (data.file.type.indexOf(t) === 0)
                            found = true;
                    })

                    if (!found) {
                        returnValue.error = "Invalid file type";
                    }
                }

                if (!returnValue.error && me.field.maxSize) {
                    if (data.file.size > me.field.maxSize) {
                        returnValue.error = "Max size exceeded";
                    }
                }

                if (!returnValue.error) {
                    returnValue.b64 = btoa(reader.result);
                }

                if (!returnValue.error) {
                    me._value.push(returnValue);
                }

                data.ready(returnValue);
                cb(returnValue);
            };
            try {
                reader.readAsBinaryString(file);
            }
            catch { }

        }

        const dropArea = this.htmlElement.closest(".exf-ctl-cnt");

        const uf = (e) => {
            this.container.classList.add("loading");
            if (!e.detail) {
                e.stopImmediatePropagation();
                e.cancelBubble = true;
                e.preventDefault();
                e.stopPropagation();
                e.returnValue = false;

                dropArea.classList.remove("drag-over");

                me.fileCount = Object.keys(e.target.files).length
                me.processCount = 0;
                const r = e => {
                    console.debug("ExoFileDropControl",`File ${me.processCount} of ${me.fileCount} processed`);
                    me.processCount++;

                    if (me.processCount === me.fileCount) {
                        try {
                            me._change();
                        }
                        finally {
                            delete me.fileCount;
                            delete me.processCount
                        }
                    }
                }
                for (var i in e.target.files) {
                    loadFile({
                        file: e.target.files[i],
                        ready: r
                    })
                }

                return false;
            }


        };

        this.htmlElement.addEventListener("change", uf);

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
        return this.htmlElement.checkValidity();
    }
}

export default ExoFileDropControl;