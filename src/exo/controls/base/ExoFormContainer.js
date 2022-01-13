// import ExoDivControl from "./ExoDivControl";
// import ExoForm  from "../../core/ExoForm";
// import DOM from "../../../pwa/DOM";

// class ExoFormContainer extends ExoDivControl {

//     _pages = [];

//     constructor(){
//         super(...arguments);

//         this.acceptProperties(
//             {
//                 name: "pages",
//                 type: Array

//             }
//         )

//         const exo = this.context.exo;

//         exo.form = document.createElement("form");
//         exo.form.setAttribute("method", "post");
//         exo.form.classList.add("exf-form");
//         exo.container = DOM.parseHTML(ExoForm.meta.templates.exocontainer);
//         exo.container.setAttribute("data-id", exo.id);
//         exo.container.appendChild(exo.form);

//     }

//     async render(){
//         await super.render();
//         this.pages.forEach(async page => {
//             let elm = await this.context.exo.renderSingleControl(page);
//             this.htmlElement.appendChild(elm)
//         });
//         return this.htmlElement
//     }

//     set pages(data){
//         this._pages = data
//     }

//     get pages(){
//         return this._pages;
//     }
// }

// export default ExoFormContainer;