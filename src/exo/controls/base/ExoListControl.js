import ExoElementControl from './ExoElementControl';
import ExoFormFactory from '../../core/ExoFormFactory';
import DOM from '../../../pwa/DOM';

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
                description: "Set the view mode (list, tiles)"
            }
        );
    }

    async populateList(containerElm, tpl) {
        const _ = this;
        const f = _.context.field;
        if (f.items && Array.isArray(f.items)) {
            let index = 0;
            f.items.forEach(i => {
                _.addListItem(f, i, tpl, containerElm, index);
                index++;
            });
        }
    }

    addListItem(f, i, tpl, container, index) {
        const _ = this;

        var dummy = DOM.parseHTML('<span/>')
        container.appendChild(dummy);

        let item = {
            ...i,
            name: typeof (i.name) === "string" ? i.name : i,
            value: (i.value !== undefined) ? i.value : i,
            type: _.optionType,
            inputname: f.name,
            checked: (i.checked || i.selected) ? "checked" : "",
            selected: (i.checked || i.selected) ? "selected" : "",
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
        else if (item.field) { // replace item.name with rendered ExoForm control
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
            case "tiles":
                elm.classList.add("tiles");

                break;
            case "list":
                elm.classList.add("list");
                break;
            default:
                elm.classList.add("block");
                break;
        }

        return elm;
    }
}

export default ExoListControl;