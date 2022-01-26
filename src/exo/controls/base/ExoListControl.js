import ExoElementControl from './ExoElementControl';
import ExoFormFactory from '../../core/ExoFormFactory';
import DOM from '../../../pwa/DOM';
import Core from '../../../pwa/Core';
import xo from '../../../../js/xo';

class ExoListControl extends ExoElementControl {

    isMultiSelect = false;

    view = "block";

    constructor() {
        super(...arguments);
        this._hasValue = true;
        this.htmlElement = document.createElement('select');

        this.acceptProperties(
            {
                name: "view",
                type: String,
                description: "Set the view mode (inline, block)"
            },
            {
                name: "items",
                type: Object,
                description: "Items to show as options"
            }
        );
    }

    async populateList(containerElm) {
        const f = this.context.field;
        let items = await Core.acquireState(this.items)
        if (items && Array.isArray(items)) {
            let index = 0;
            items.forEach(i => {
                this.addListItem(f, i, containerElm, index);
                index++;
            });
        }
    }

    getListItemTemplate(item) { 
        // to be implemented
    }

    get baseType() {
        return "multi";
    }

    addListItem(f, i, container, index) {
        
        let item = {
            name: typeof (i.name) === "string" ? i.name : i.toString(),
            value: (i.value != undefined) ? i.value : i,
            inputname: f.name || f.id,
            
            disabled: (i.disabled || i.enabled === false) ? "disabled" : "",
            tooltip: (i.tooltip || i.name || "").replace('{{field}}', ''),
            oid: f.id + "_" + index,
            description: i.description || ""
        }
        item.checked = this.isItemSelected(item) ? "checked" : "";

        container.appendChild(DOM.parseHTML(this.getListItemTemplate(item)));
    }

    isItemSelected(item) {
        let checked;
        if (Array.isArray(this.value)) {
            checked = this.value.includes(typeof (item) === "string" ? item : item.value) 
        }
        else {
            checked = (item.checked || item.selected) 
        }
        return checked;
    }

    async render() {
        let elm = await super.render();

        switch (this.view) {

            case "inline":
                elm.classList.add("horizontal");
                break;
            default:
                elm.classList.add("block");
                break;
        }

        return elm;
    }
}

export default ExoListControl;