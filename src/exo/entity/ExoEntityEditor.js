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

    async show() {
        this.editDialog = await this.showDialog({
            modal: false,
            title: this.data.id ? `Edit` : `Add`,
            body: await this.getForm(),
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
    
    async getForm() {
        let schema = this.schema;

        const editFrm = await xo.form.run(schema, {
            context: this.host.options.exoContext,

            on: {
                schemaLoaded: async (e) => {
                    this.editorForm = e.detail.host;
                    this.events.trigger("editFormLoaded", {
                        exo: e.detail.host,
                    });
                },
            },
        });
        return editFrm;
    }

    async _handleButtonClick(e, button) {


        if (e && e.target && e.target.tagName !== "BUTTON") {
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
            } catch (err) {
                // grid._control.events.trigger(trigger, { success: false });

                console.error(err);

            } finally {
                this.editing = false;
            }
        }
    }

    async showDialog(options) {

        let r = await xo.form.run({
            ...options || {},
            type: "dialog"
        });
        var f = xo.form.factory.getFieldFromElement(r);

        f._control.show();
        return f._control;

    }

}

export default ExoEntityEditor