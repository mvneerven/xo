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
                        title: { type: "string" },
                        fileTypes: { type: "array" },
                        maxSize: { type: "number" }
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
                        
                        let r = await xo.form.run({
                            type: "filedialog",
                            title: title,
                            fileTypes: this.dialog.fileTypes,
                            maxSize: this.dialog.maxSize,
                            name: "drop",
                            click: async (button, event) => {
                                if (button === "confirm") {
                                    let exo = xo.form.from(event.target.closest(".exf-dlg-c")?.querySelector("form"));
                                    let ctl = exo.get("drop");
                                    if (ctl.value?.length) {
                                        let file = ctl.value[0];
                                        let url = `data:${file.type};base64,${file.b64}`;
                                        me.value = url;
                                        var evt = new Event("change", { bubbles: true, cancelable: true })
                                        me.htmlElement.dispatchEvent(evt);
                                    }
                                }
                            }
                        });
                        let ctl = xo.control.get(r);
                        ctl.show();
                    }
                }
            }
        }

        await super.render();
        return this.container;
    }
}

export default ExoUrlControl;