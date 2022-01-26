import ExoListControl from './ExoListControl';

// Renders a single select / dropdown list
class ExoDropdownListControl extends ExoListControl {
    constructor() {
        super(...arguments);
        this.htmlElement = document.createElement('select');
        this.htmlElement.setAttribute("size", "1");
    }

    async render() {
        await super.render();
        this._rendered = false;
        let f = this.context.field;

        await this.populateList(this.htmlElement);

        this.htmlElement.value = this.value;
        this.container.classList.add("exf-input-group", "exf-std-lbl");
        this._rendered = true;
        return this.container;
    }

    set value(data) {
        this._value = data;
        this.htmlElement.value = data;
    }

    get value() {
        if (this.rendered)
            return this.htmlElement.value;

        return this._value;
    }

    getListItemTemplate(item) {
        let selected = item.checked ? 'selected' : '';
        return /*html*/`<option class="${item.class}" ${selected} value="${item.value}">${item.name}</option>`;
    }
}

export default ExoDropdownListControl;