import ExoInputListControl from './ExoInputListControl';

class ExoCheckboxListControl extends ExoInputListControl {
    static returnValueType = Array;

    get value() {
        let ar = [];
        this.htmlElement.querySelectorAll(":checked").forEach(i => {
            ar.push(i.value);
        });
        return ar;
    }

    set value(data) {
        this._value = data;
        this.htmlElement.querySelectorAll("[name]").forEach(i => {
            i.checked = Array.isArray(this._value) ? this._value.find(j => { // use find instead of direct .includes() call
                return i.value == j; // do loose comparison to account for numeric/string matches
            }) : false
        });
    }

    getListItemTemplate(item) {
        return /*html*/`<div class="exf-ilc-cnt" title="${item.tooltip}">
        <input class="${item.class}" ${item.disabled} ${item.checked} name="${item.inputname}" value="${item.value}" type="checkbox" id="${item.oid}" />
        <label for="${item.oid}" class="exf-caption">
            <div class="exf-caption-main">${item.name}</div>
            <div title="${item.description}" class="exf-caption-description">${item.description}</div>
        </label>
    </div>`;
    }

    isItemSelected(item) {
        if (!Array.isArray(this._value))
            return false;

        let isSel = this._value.find(i => {
            return i == item.value
        })

        return isSel;
    }

}

export default ExoCheckboxListControl;