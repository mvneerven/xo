import ExoControlBase from './ExoControlBase';

class ExoElementControl extends ExoControlBase {
    static returnValueType = undefined;

    constructor(context) {
        super(context);

        if (context.field.tagName) {
            try {
                this.htmlElement = document.createElement(context.field.tagName);
                if (this.htmlElement.nodeName !== context.field.tagName.toUpperCase()) {
                    throw "'" + context.field.tagName + "' is not a valid tagName";
                }

                if (!this.isSelfClosing) {
                    this.acceptProperties(
                        {
                            name: "html",
                            type: String,
                            description: "Inner HTML"
                        }
                    );
                }


                if (this.html) {
                    this.htmlElement.innerHTML = this.html;
                }

            }
            catch (ex) {
                throw "Could not generate '" + context.field.tagName + "' element: " + ex.toString();
            }
        }
    }
}

export default ExoElementControl;