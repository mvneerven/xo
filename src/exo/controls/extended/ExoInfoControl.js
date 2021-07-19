import ExoBaseControls from '../base';
import DOM from '../../../pwa/DOM';

class ExoInfoControl extends ExoBaseControls.controls.div.type {

    title = ""

    body = "";

    icon = "ti-info";

    constructor(context) {
        super(context);
        this.acceptProperties("title", "icon", "body", "class");
    }

    async render() {
        

        //let html = DOM.format(_.template, { ...this })

        this.htmlElement.appendChild(
            DOM.parseHTML(this.getTemplate(this)));


        return this.htmlElement;
    }

    getTemplate(obj) {
        return /*html*/`<section class="exf-info ${obj.class}">
    <div class="exf-info-title"><span class="exf-info-icon ${obj.icon}"></span><span class="exf-info-title-text">${obj.title}</span></div>
    <div class="exf-info-body">${obj.body}</div>
    </section>`
    }
}

export default ExoInfoControl;