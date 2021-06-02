import ExoDivControl from "../base/ExoDivControl";
import DOM from '../../../pwa/DOM';
import Core from '../../../pwa/Core';

/**
 * TODO:
 * - different views (using SCSS on [data-view="tiles"], [data-view="grid"], ...)
 * - Search/live filtering (as in gridjs)
 * - deletion: implement .on("action") -> id: "delete" - see listen() method
 * - manage selection state
 *      - and return in .value() getter
 *      - trigger change event on selection change
 *      - paging (getItems with skip & take), pageSize property (acceptProperties)
 *      - validation & required state (minimum selection of 1)
 */

class ExoListViewControl extends ExoDivControl {

    views = ["tiles", "grid", "details"];

    _controls = [
        {
            type: "button",
            name: "del",
            caption: "⨯",
            tooltip: "Delete selected",
            useSelection: true

        },
        {
            type: "button",
            name: "add",
            caption: "+",
            tooltip: "Add item"
        },

        {
            type: "button",
            name: "view",
            caption: "▢",
            tooltip: "Switch view"
        }
    ]

    viewIndex = 0;

    constructor() {
        super(...arguments);

        this.events = new Core.Events(this);

        this.acceptProperties(
            {
                name: "value" // current selection (array of ids)
            },
            {
                name: "items",
                type: Object,
                description: "Object array, url to fetch, callback function, or promise to get the data from"
            },
            {
                name: "view",
                description: "Current view (tiles, grid, details)"
            },
            {
                name: "pageSize" //TODO
            },
            {
                name: "controls" // default _controls now used
            }

        );
    }

    async render() {
        await super.render();

        this.listDiv = this.createListDiv()

        let arr = await this.getItems();
        arr.forEach(i => {
            this.listDiv.appendChild(DOM.parseHTML(this.getTileTemplate(i)));
        })

        this.addControls(); // button bar

        this.container.classList.add("exf-listview");
        this.view = this.views[this.viewIndex]; // set initial view - can be toggled using button bar

        return this.container;
    }

    createListDiv() {
        let div = DOM.parseHTML(/*html*/`<div class="exf-listview-list"></div>`)
        this.htmlElement.appendChild(div);

        //TOD: adapt container height 
        const setC = () => {
            let h = window.innerHeight - 250
            div.parentElement.style.height = h + "px";
        }

        DOM.throttleResize(window, setC);

        return div;
    }

    // add button bar
    addControls() {
        let elm = this.container;
        this.selectionDependencies = []; // keep list of elements that depend on list selection

        let btns = document.createElement("div");
        btns.classList.add("exf-listview-btns", "exf-cnt");
        if (Array.isArray(this.controls)) {
            this.controls.forEach(c => {
                // render single controls
                xo.form.run(c).then(e => {
                    btns.appendChild(e)
                    if (c.useSelection) {
                        this.selectionDependencies.push(e)
                        DOM.disable(e);
                    }
                })
            })
        }

        elm.appendChild(btns);

        btns.addEventListener("click", e => {
            e.stopPropagation();

            let id = e.target.closest('button').name;

            this.events.trigger("action", {
                id: id
            })

            e.returnValue = false;
        })

        this.listen();
    }

    listen(){
        this.on("action", e => {
            switch (e.detail.id) {
                case "del":
                    let selectedIds = this.value;
                    console.log("graceful delete ", selectedIds)
                    //TODO graceful hide of elements, trigger delete event with selection, if failed handle...
                    break;
                case "add":
                    // not handled here, but in host
                    break;
                case "view":
                    this.toggleView();
                    break;
            }
        })
    }

    // toggles between the available views
    toggleView() {
        this.viewIndex++;
        if (this.viewIndex > this.views.length)
            this.viewIndex = 0;

        this.view = this.views[this.viewIndex]
    }

    // set current view - sets the data-view attribute on container (div.exf-ctl-cnt)
    set view(value) {
        let ix = this.views.indexOf(value);
        if (ix >= 0) {
            this.viewIndex = ix;
            if(this.rendered)
                this.container.setAttribute("data-view", this.view);
        }
    }

    get view() {
        return this.views[this.viewIndex]
    }

    get controls() {
        return this._controls;
    }

    set controls(value) {
        this._controls = value;
    }

    // updates the array of items to display
    async getItems() {
        return new Promise(resolve => {
            if (Core.isUrl(this.items)) {
                fetch(this.items).then(x => {
                    if (x.status === 200) {
                        resolve(x.json());
                        return;
                    }
                    throw Error(`HTTP error ${x.status} - ${this.items}`);
                })
            }
            else if (Array.isArray(this.items)) {
                resolve(this.items);
            }
            else if (typeof (this.items) === "function") {
                resolve(this.items());
            }
            else {
                return resolve(Promise.resolve(this.items));
            }
        });
    }

    // should set the selected items
    set value(data) {
        this._value = data;
    }

    // should return an array of selected ids
    get value() {
        return this._value;
    }

    // See constructor: acceptProperties
    set items(data) {
        this._items = data;
    }

    // See constructor: acceptProperties
    get items() {
        return this._items;
    }

    getTileTemplate(item) {

        return /*html*/`<article data-id="${item.id}" class="exf-lv-item">
    <img src="${item.imageUri}" alt="${item.name}" />
    <div class="text">
        <h3>${item.name}</h3>
        <p>${item.description}</p>

        
        
    </div>
</article>` ;

    }

}

export default ExoListViewControl