import ExoBaseControls from '../base/ExoBaseControls';
import DOM from '../../../pwa/DOM';

// TODO finish
class DropDownButton extends ExoBaseControls.controls.list.type {

    navTemplate = /*html*/`
        <nav class="ul-drop" role='navigation'>
            <ul>
                <li>
                    <a class="user-icon" href="#"><span class="ti-user"></span></a>
                    <ul></ul>
                </li>
            </ul>
        </nav>`;

    constructor(context) {
        super(context);
        this.context.field.type = "hidden";
        this.htmlElement = DOM.parseHTML(this.navTemplate);
    }

    async render() {
        let f = this.context.field;
        const tpl = /*html*/`<li title="{{tooltip}}"><a class="{{class}}" href="{{value}}">{{name}}</a></li>`;
        await this.populateList(this.htmlElement.querySelector("ul > li > ul"), tpl);
        return await super.render();
    }

    setupButton() {
        const _ = this;
        document.querySelector("body").classList.add("signed-out");
        container.appendChild(DOM.parseHTML(DOM.format(tpl, data, { empty: undefined })));
    }
}

export default DropDownButton;
