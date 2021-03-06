import ExoElementControl from './ExoElementControl';
import ExoForm from '../../core/ExoForm';
import DOM from '../../../pwa/DOM';
import Core from '../../../pwa/Core';

class ExoInputControl extends ExoElementControl {

    static returnValueType = String;  

    constructor() {
        super(...arguments);
        this._hasValue = true;    
        this.htmlElement = document.createElement('input');  
    }

    async render() {
        var f = this.context.field;

        await super.render();

        if(DOM.inputTypeExists(this.type)) // only set type attribute if valid HTML input type
            this.htmlElement.setAttribute("type", this.type);

        this.testDataList();

        switch (this.context.field.type) {
            case "color":
                this.container.classList.add("exf-std-lbl");
                break;
            case "hidden":
                this.container.classList.add("exf-hidden");
                break;
        }

        return this.container
    }

    set type(value){       
        this._type = value;
    }

    get type(){
        return this._type;
    }

    destroyDataList() {
        let dl = this.container.querySelector("datalist")
        if (dl) {
            dl.remove();
        }
    }

     testDataList() {
        let f = this.context.field;

        if (f.lookup) {
            if (Array.isArray(f.lookup)) {
                this.createDataList(f.lookup);
            }
            else {
                let query = (q) => {
                    let url = f.lookup.replace(".json", "_" + q + ".json");
                    url = new URL(url, this.context.baseUrl);

                    fetch(url).then(x => x.json()).then(data => {1
                        this.createDataList(data);
                    })
                };

                if (!Core.isValidUrl(f.lookup)) {
                    query = this.getFetchLookup(f);
                }

                this.htmlElement.addEventListener("keyup", e => {
                    query(this.htmlElement.value);
                })
            }
        }
     }

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

    getFetchLookup(f) {
        const o = {
            field: f, type: "lookup", data: f.lookup, callback: (field, data) => {
                this.createDataList.call(this, data)
            }
        };

        if (o.data.type === "OpenData") { // TODO enhance
            return (q) => {
                q = q.substr(0, 1).toUpperCase() + q.substr(1);
                let url = o.data.url + "?$top=20&$filter=substring(" + o.data.field + ",0," + q.length + ") eq '" + q + "'";
                fetch(url).then(x => x.json()).then(data => {
                    if (data?.value) {
                        o.callback(o.field, data.value.map(e => {
                            return e.Title
                        }));
                    }
                })
            }
        }

        else if (o.data.type === "promise"){
            return (q) => { 
                this.getItems(o.data.items).then(x => {
                    o.callback(o.field, x);
                });
            } 
           
        }

        return this.context.exo.options.get(o)
    }

    async getItems(items) {
        return new Promise(resolve => {
            if (Core.isUrl(items)) {
                fetch(items).then(x => {
                    if (x.status === 200) {
                        resolve(x.json());
                        return;
                    }
                    throw Error(`HTTP error ${x.status} - ${this.items}`);
                })
            }
            else if (Array.isArray(items)) {
                resolve(items);
            }
            else if (typeof (items) === "function") {
                resolve(items());
            }
            else {
                return resolve(Promise.resolve(items));
            }
        });
    }

    createDataList(data) {
        const id = this.context.field.id;
        this.htmlElement.setAttribute("list", "list-" + id);
        let dl = this.container.querySelector("datalist");
        if (dl) dl.remove();
        const dataList = DOM.parseHTML(DOM.format(ExoForm.meta.templates.datalist, {
            id: "list-" + id
        }));
        data.forEach(el => {
            let o = {
                value: el,
                label: el.name,
                ...el,
            };

            dataList.appendChild(DOM.parseHTML(DOM.format(ExoForm.meta.templates.datalistItem, o)));
        });
        this.container.appendChild(dataList);
    }
}

export default ExoInputControl;