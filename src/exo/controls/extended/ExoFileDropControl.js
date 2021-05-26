import ExoBaseControls from '../base/ExoBaseControls';
import DOM from '../../../pwa/DOM';

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
        return this.htmlElement.checkValidity();
    }
}

export default ExoFileDropControl;