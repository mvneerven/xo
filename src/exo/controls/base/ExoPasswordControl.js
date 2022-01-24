import ExoTextControl from "./ExoTextControl"

class ExoPasswordControl extends ExoTextControl {


    constructor() {
        super(...arguments);
        
        this.acceptProperties(
            {
                name: "toggleClearText",
                type: Boolean,
                default: true
            }
        );
        this.htmlElement.type = "password";

    }

    mapAcceptedProperties(){
        super.mapAcceptedProperties();
        const me = this;
        
        if (this.toggleClearText) {
            this.suffix = {
                icon: "ti-eye",
                click: e => {
                    me.htmlElement.type = me.htmlElement.type === "password" ? "text" : "password";
                    me.htmlElement.focus();
                }
            }
        }

    }


}

export default ExoPasswordControl