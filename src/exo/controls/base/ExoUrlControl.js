import ExoTextControl from './ExoTextControl';

class ExoUrlControl extends ExoTextControl {
    constructor() {
        super(...arguments);

        this.acceptProperties(
            {
                name: "dialog",
                description: "Shows a dialog to select a URL with or create a dataUrl"
            },

            { 
                name: "fileTypes", 
                type: String | Array, 
                description: 'Array of strings - example: ["image/"]' 
            },

            {
                name: "dialogTitle",
                type: String,
                description: "Title to show in the file upload dialog"
            }
        )
    }

    async render() {
        const me = this;

        if (this.dialog) {
            this.suffix = {
                field: {
                    type: "button",
                    name: "file-btn",
                    icon: "ti-file",
                    click: async e => {
                        const context = {};
                        let r = await xo.form.run({
                            type: "filedialog",
                            title: this.dialogTitle || "Upload or select a file",
                            fileTypes: me.fileTypes,
                            name: "test",
                            click: async (button, event) => {
                                if (button === "confirm") {
                                    let field = context.field._control.exo.get("drop");
                                    let fileDropCtl = field._control;
                                    if (fileDropCtl.value && fileDropCtl.value.length) {
                                        let file = fileDropCtl.value[0];
                                        let url = `data:${file.type};base64,${file.b64}`;
                                        me.value = url;
                                        var evt = document.createEvent("HTMLEvents");
                                        evt.initEvent("change", true, true);
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