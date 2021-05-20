import ExoListControl from './ExoListControl';

class ExoDropdownListControl extends ExoListControl {
    constructor(context) {
        super(context);
        
        this.htmlElement = document.createElement('select');
        this.htmlElement.setAttribute("size", "1");
    }

    async render() {
        let f = this.context.field;
        const tpl = /*html*/`<option class="{{class}}" {{selected}} value="{{value}}">{{name}}</option>`;
        await this.populateList(this.htmlElement, tpl);
        await super.render();
        this.container.classList.add("exf-input-group", "exf-std-lbl");

        return this.container;
    }
}

export default ExoDropdownListControl;