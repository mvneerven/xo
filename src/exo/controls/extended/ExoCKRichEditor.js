import ExoBaseControls from '../base/ExoBaseControls';
import DOM from '../../../pwa/DOM';

class ExoCKRichEditor extends ExoBaseControls.controls.div.type {
    constructor(context) {
        super(context);

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

export default ExoCKRichEditor;