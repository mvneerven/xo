import Core from '../../pwa/Core';
import DOM from '../../pwa/DOM';

class ExoEntityEditor {
    constructor(host, data) {
        if (!data || typeof (data) !== "object")
            throw TypeError("Must provide data to edit");

        this.host = host;
        this.data = data;
        this.editDialog = null;
        this.events = new Core.Events(this);
    }

    async show(options) {
        this.editDialog = await DOM.showDialog({
            modal: false,
            title: this.data.id ? `Edit` : `Add`,
            body: await this.render(options),
            confirmText: "Save",
            cancelText: "Cancel",

            click: (button, event) => {
                this._handleButtonClick(event, button);
            },
        });

        // hook dialog button to form state (dialog buttons are not a part of the form)
        let confirmBtn = this.editDialog.dlg.querySelector("button.confirm");
        this.editDialog.dlg
            .querySelector("form")
            .addEventListener("change", (e) => {
                let fn = this.editorForm.addins.validation.checkValidity()
                    ? "enable"
                    : "disable";
                DOM[fn](confirmBtn);
            });
        return this.editDialog;
    }

    get schema() {
        return this.host.entitySettings._generateEditorFormSchema(this.data);
    }
    
    async render(options) {
        let schema = this.schema;

        const editFrm = await xo.form.run(schema, {
            context: this.host.options.exoContext,

            on: {
                created: e => {
                    this.editorForm = e.detail.host;
                    this.host.events.trigger("editorCreated", {
                        exo: this.editorForm
                    })
                },  
                schemaLoaded: async (e) => {
                    
                    this.events.trigger("editFormLoaded", {
                        exo: e.detail.host,
                    });
                },
            },
            ...options || {}
        });
        return editFrm;
    }

    async _handleButtonClick(e, button) {
        if (e?.target?.tagName !== "BUTTON") {
            e.cancelBubble = true;
            return;
        }

        if (button === "confirm") {
            const editData = this.data;
            try {

                if (editData.id) {
                    await this.host.entitySettings.api.put("", editData);
                } else {
                    await this.host.entitySettings.api.post("", editData);
                }
            } catch (ex) {
                console.error(ex);

            } finally {
                this.editing = false;
            }
        }
    }
}

export default ExoEntityEditor