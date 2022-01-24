import ExoControlBase from '../ExoControlBase';

class ExoElementControl extends ExoControlBase {
    static returnValueType = undefined;

    constructor() {
        super(...arguments);

        if (this.context.field.tagName) {
            try {
                this.htmlElement = document.createElement(this.context.field.tagName);
                if (this.htmlElement.nodeName !== this.context.field.tagName.toUpperCase()) {
                    throw TypeError("'" + this.context.field.tagName + "' is not a valid tagName");
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


                

            }
            catch (ex) {
                throw TypeError("Could not generate '" + this.context.field.tagName + "' element: " + ex.toString());
            }
        }
    }

    mapAcceptedProperties(){
        super.mapAcceptedProperties();

        if (this.html) {
            this.htmlElement.innerHTML = this.html;
        }
    }
}

export default ExoElementControl;