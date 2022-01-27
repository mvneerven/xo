import ExoInputListControl from './ExoInputListControl';

class ExoRadioButtonListControl extends ExoInputListControl {
    set value(data) {

        if(data && typeof(data) !== "string")
            throw TypeError("Invalid value property for Radiobuttonlist")
            
        this._value = data;
        
        this.htmlElement.querySelectorAll("[name]").forEach(el => {
            if (el.value == data)
                el.checked = true;
        });
    }

    get value() {
        if(!this._rendered)
            return this._value;

        let inp = this.htmlElement.querySelector("[name]:checked");
        this._value = inp ? inp.value : "";
        return this._value;
    }

    getListItemTemplate(item) {
        return /*html*/`<div class="exf-ilc-cnt" title="${item.tooltip}">
        <input class="${item.class}" ${item.disabled} ${item.checked} name="${item.inputname}" value="${item.value}" type="radio" id="${item.oid}" />
        <label for="${item.oid}" class="exf-caption">
            <div class="exf-caption-main">${item.name}</div>
            <div title="${item.description}" class="exf-caption-description">${item.description}</div>
        </label>
    </div>`;
    }

    isItemSelected(item){
        return this._value === item.value
    }
}

export default ExoRadioButtonListControl;