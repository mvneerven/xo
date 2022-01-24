import ExoBaseControls from '../base';
import DOM from '../../../pwa/DOM';
import Core from '../../../pwa/Core';

class ExoCKRichEditor extends ExoBaseControls.controls.div.type {
    constructor() {
        super(...arguments);
        this.htmlElement.data = {};
    }

    get value() {
        if (this.rendered)
            this._data = this.htmlElement.data.editor.getData();

        return this._data;
    }

    set value(data) {
        this._data = data;
        if (this.rendered)
            this.htmlElement.data.editor.setData(data);
    }

    async render() {
        const me = this;

        await super.render();
        //const me = me.htmlElement;
        return new Promise((resolve, reject) => {
            DOM.require("https://cdn.ckeditor.com/ckeditor5/17.0.0/classic/ckeditor.js", () => {
                Core.waitFor(() => {
                    return typeof (ClassicEditor) !== "undefined";

                }, 200).then(() => {
                    ClassicEditor
                        .create(me.htmlElement)
                        .catch(error => {
                            console.error(error);
                        }).then(ck => {
                            me.htmlElement.data["editor"] = ck;
                        });
                    resolve(me.container);
                });

            });

        })
    }
}

export default ExoCKRichEditor;