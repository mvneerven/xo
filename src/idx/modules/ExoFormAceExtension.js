const DOM = window.xo.dom;
const factory = window.xo.form.factory;
//import ExoFormSchema from '../../exo/core/ExoFormSchema';

class ExoFormAceExtension {
    static extend(context) {

        // class ExoSchemaEditor extends factory.library.aceeditor.type {
        //     async render() {
        //         await super.render();

        //         this.modeSwitch = DOM.parseHTML('<div title="Switch js/json" style="cursor: pointer; position:absolute; top: 10px; right: 30px">' + this.mode + '</div>');
        //         this.modeSwitch.addEventListener("click", e => {
        //             this.mode = this.mode === "javascript" ? "json" : "javascript";

        //             let contentType = this.checkAceMode(this.value);

        //             if (this.mode !== contentType) {
        //                 this.convertValue(this.mode);
        //             }
        //             this.modeSwitch.innerText = this.mode;
        //         });

        //         this.container.appendChild(this.modeSwitch)

        //         this.ace.on("change", e => {
        //             let data = this.ace.getValue();
        //             if (data.length > 10) {
        //                 let contentType = this.checkAceMode(data);
        //                 if (contentType !== this.mode)
        //                     this.mode = contentType;
        //             }
        //         })

        //         return this.container;
        //     }

        //     set schema(value) {

        //         try{
        //             let sch = this.context.exo.context.createSchema();
        //             sch.parse(value);
        //             this.value = sch.toString(this.mode)
        //         }
        //         catch(ex){
        //             console.error("ExoFormAceExtension.schema setter", ex)
        //             this.value = value;
        //         }
        //     }

        //     set mode(value) {
        //         super.mode = value;

        //         if (this.modeSwitch)
        //             this.modeSwitch.innerText = value;
        //     }

        //     get mode() {
        //         return super.mode;
        //     }

        //     checkAceMode(value) {

        //         if (typeof (value) == "string") {
        //             if (value.length > 6 && value.startsWith("const ")) {
        //                 return "javascript"
        //             }
        //             else if (value.startsWith("{")) {
        //                 return "json"
        //             }
        //         }
        //         else if (typeof (value) === "object") {
        //             if (value.model && typeof (value.model.logic) === "function")
        //                 return "javascript"

        //             return "json";
        //         }
        //         throw TypeError("Unknown ace mode: " + value);
        //     }

        //     convertValue(targetMode) {
        //         const xs = xo.form.factory.Schema.read(this.value)
        //         this.value = xs.toString(targetMode);
        //     }

            
        // }

        // context.library.xo_schema = {
        //     ...context.library.aceeditor,
        //     name: "xo_schema",
        //     hidden: true,
        //     type: ExoSchemaEditor
        // };
    }

}

export default ExoFormAceExtension;