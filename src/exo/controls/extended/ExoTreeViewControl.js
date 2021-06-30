import Core from "../../../pwa/Core";
import DOM from "../../../pwa/DOM";
import ExoDivControl from "../base/ExoDivControl";

class ExoTreeViewControl extends ExoDivControl {
    options = {
        rootClass: "c-tree",
        Url: null
    }

    _valid = true;

    _minimum = 0;

    singleSelect = false;

    set items(treeObj) {
        this._items = treeObj
    }

    constructor() {
        super(...arguments)

        this.acceptProperties(
            {
                name: "items",
                type: Object | Array,
                description: "The structure to render a Treeview from"
            },
            {
                name: "mappings",
                type: Object,
                description: "Mappings to use for treeview properties 'title', 'tooltip', 'id'"
            },

            {
                name: "singleSelect",
                type: Boolean,
                description: "Specifies that the TreeView selection must be limited to a single item",
                default: true
            },
            {
                name: "minimum",
                type: Number,
                description: "If not singleSelect, sets the minimum amount of items that need to be selected"
            }

        );
    }

    // updates the array of items to display
    async getData(data, options) {
        return new Promise((resolve) => {
            if (Core.isUrl(data)) {
                fetch(data).then((x) => {
                    if (x.status === 200) {
                        resolve(x.json());
                        return;
                    }
                    throw new Error(`HTTP error ${x.status} - ${data}`);
                });
            } else if (typeof (data) === "object") {
                resolve(data);
            } else if (typeof data === "function") {
                resolve(data(options || {}));
            } else {
                return resolve(Promise.resolve(data));
            }
        });
    }

    set minimum(value) {
        this._minimum = value;
        if (value > 0)
            this.required = true;
    }

    get minimum() {
        return this._minimum
    }

    async render() {
        await super.render();

        let elm = await this.createTreeView();
        this.variable = DOM.parseHTML(`<input type="hidden" name="${this.context.field.name}" value="${this.value || ''}" />`);
        this.container.appendChild(this.variable);

        elm.addEventListener("click", (e) => {
            let isText = e.target.closest("span") != null,
                li = e.target.closest("li");

            if (!li)
                return;

            if (!isText) {
                li.classList.toggle("expanded");
            }
            else {
                this.updateValue(li);
                this.triggerChange()
            }
        });

        this.container.classList.add("exf-std-lbl");
        return this.container
    }

    updateValue(li) {
        let id = li.getAttribute("data-id"),
            isCurrentlySelected = li.classList.contains("selected");           

        if (this.singleSelect) {
            this.container.querySelectorAll("li").forEach(i => {
                i.classList.remove("selected");
            })
            li.classList.add("selected");
            this.value = id;
        }
        else {
            this.value = Array.isArray(this.value) ? this.value : [];

            if (isCurrentlySelected) {
                li.classList.remove("selected");
                this.value = this.value.filter(i => {
                    return i !== id
                })
            }
            else {
                li.classList.add("selected");
                this.value.push(id)
            }
        }
    }

    triggerChange() {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", true, true);
        this.variable.dispatchEvent(evt);
    }

    async createTreeView() {
        const elm = this.htmlElement;
        elm.classList.add("exf-treeview", "no-user-select");

        let level = 0;

        const add = (ul, item) => {

            item = this.mapProps(item);
            let cls = level === 0 ? "expanded" : "" + (this.isSelected(item) ? " selected" : "");

            let li = DOM.parseHTML(`<li class="${cls}" title="${item.tooltip}" data-id="${item.id}"><span>${item.title}</span></li>`)
            ul.appendChild(li);

            if (item.children) {

                level++;
                ul = document.createElement('ul')
                li.appendChild(ul);
                for (var i in item.children) {
                    let child = item.children[i];
                    add(ul, child);
                }
                level--;
            }
            else {
                li.classList.add("leaf")
            }
        }
        let root = document.createElement('ul')
        root.classList.add(this.options.rootClass)
        elm.appendChild(root);

        let obj = await this.getData(this._items);
        add(root, obj);

        return elm;
    }

    isSelected(item) {
        if (this.singleSelect) {
            if (item.id === this.value) {
                return true
            }
        }
        else {
            if (Array.isArray(this.value)) {
                return this.value.includes(item.id)
            }
        }
    }

    mapProps(item) {
        if (this.mappings) {
            for (var n in this.mappings) {
                item[n] = item[this.mappings[n]]
            }
        }

        item.id = item.id === undefined ? item.name : item.id;

        return item;
    }

    get value() {
        return this._value;
    }

    set value(data) {
        if(!data)
            return;

        if (this.singleSelect) {
            this._value = data;
            if (this.rendered) {
                this.variable.value = this._value;
            }
            this._valid = true;
        }
        else {
            if (!Array.isArray(data))
                data = [data];

            this._value = data;

            if (this.rendered) {
                this.variable.value = this._value.join(',');
            }

            this._valid = data.length >= this.minimum;
        }

    }

    set valid(valid) {
        this._valid = this.required ? valid : true;
    }

    get valid() {
        return this._valid;
    }

    get validationMessage() {
        this.minimum = this.minimum || 1;
        return `Select at least ${this.minimum} item(s)`;
    }

}

export default ExoTreeViewControl