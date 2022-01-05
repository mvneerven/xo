import ExoElementControl from './ExoElementControl';
import ExoFormFactory from '../../core/ExoFormFactory';
import DOM from '../../../pwa/DOM';
import Core from '../../../pwa/Core';

class ExoListControl extends ExoElementControl {

    isMultiSelect = false;

    view = "block";

    constructor(context) {
        super(context);
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

    async populateList(containerElm, tpl) {
        const f = this.context.field;
        let items = await Core.acquireState(this.items)
        if (items && Array.isArray(items)) {
            let index = 0;
            items.forEach(i => {
                this.addListItem(f, i, tpl, containerElm, index);
                index++;
            });
        }
    }

    get baseType(){
        return "multi";
    }

    addListItem(f, i, tpl, container, index) {
        const _ = this;

        var dummy = DOM.parseHTML('<span/>')
        container.appendChild(dummy);

        let isSelected = this.isItemSelected(i);
        let item = {
            ...i,
            name: typeof (i.name) === "string" ? i.name : i.toString(),
            value: (i.value != undefined) ? i.value : i,
            type: _.optionType,
            inputname: f.name || f.id,
            checked: isSelected ? "checked" : "",
            selected: isSelected,
            disabled: (i.disabled || i.enabled === false) ? "disabled" : "",
            tooltip: (i.tooltip || i.name || "").replace('{{field}}', ''),
            oid: f.id + "_" + index
        }

        var o = {
            field: f,
            control: _,
            item: item
        };

        if (item.element) {
            o.listElement = item.element;
            DOM.replace(dummy, item.element);
        }
        else if (item.field) { // replace item.name with rendered XO form control
            this.renderFieldSync(item, tpl, container);
        }
        else if (item.html) {
            o.listElement = DOM.parseHTML(item.html);
            DOM.replace(dummy, o.listElement);
        }
        else {
            var s = DOM.format(tpl, item);
            o.listElement = DOM.parseHTML(s);
            DOM.replace(dummy, o.listElement);
        }
        _.context.exo.events.trigger(ExoFormFactory.events.getListItem, o);
    }

    isItemSelected(item) {
        return (item.checked || item.selected) ? "checked" : ""
    }

    // use trick to run async stuff and wait for it.
    renderFieldSync(item, tpl, container) {
        return (async (item, tpl) => {
            if (item.name.indexOf('{{field}}') === -1) {
                item.tooltip = item.tooltip || item.name;
                item.name = item.name + '{{field}}'
            }

            const exoContext = this.context.exo.context;

            let e = await exoContext.createForm().renderSingleControl(item.field);
            item.name = DOM.format(item.name, {
                field: e.outerHTML
            });
            container.appendChild(DOM.parseHTML(DOM.format(tpl, item)));
        })(item, tpl) //So we defined and immediately called this async function.
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