import ExoTextControl from './ExoTextControl';

class ExoUrlControl extends ExoTextControl {
    constructor() {
        super(...arguments);

        this.acceptProperties(
            {
                name: "dialog",
                description: `Shows a dialog to select a URL with or create a dataUrl from an uploaded file. 
                Can be true, or an object structure descibing the dialog: {title: "My dialog", fileTypes: ["text/"]}`,
                type: Object,
                objectSchema: { // TODO: implement in 
                    $schema: "http://json-schema.org/draft-04/schema#",
                    properties: {
                        title: {type: "string"},
                        fileTypes: {type: "array"},
                        maxSize: {type: "number"}
                    },
                    required: []
                }
            }
        )
    }

    async render() {
        const me = this;

        if (this.dialog) {
            let title = this.dialog.title || "Upload or select a file";
            this.suffix = {
                field: {
                    type: "button",
                    name: "file-btn",
                    tooltip: title,
                    icon: "ti-file",
                    click: async e => {
                        const context = {};
                        let r = await xo.form.run({
                            type: "filedialog",
                            title: title,
                            fileTypes: this.dialog.fileTypes,
                            maxSize: this.dialog.maxSize,
                            name: "test",
                            click: async (button, event) => {
                                if (button === "confirm") {
                                    let field = context.field._control.exo.get("drop");
                                    let fileDropCtl = field._control;
                                    if (fileDropCtl.value && fileDropCtl.value.length) {
                                        let file = fileDropCtl.value[0];
                                        let url = `data:${file.type};base64,${file.b64}`;
                                        me.value = url;
                                        var evt = new Event("change", {bubbles: true, cancelable: true})
                                        me.htmlElement.dispatchEvent(evt);
                                    }
                                }
                            }
                        });
                        context.field = window.xo.form.factory.getFieldFromElement(r);
                        context.field._control.show();
                    }
                }
            }
        }

        await super.render();
        return this.container;
    }
}

export default ExoUrlControl;