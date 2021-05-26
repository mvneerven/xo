import ExoElementControl from './ExoElementControl';
import ExoForm from '../../core/ExoForm';
import DOM from '../../../pwa/DOM';
import Core from '../../../pwa/Core';

class ExoInputControl extends ExoElementControl {

    static returnValueType = String;

    constructor(context) {
        super(context);
        this.htmlElement = document.createElement('input');
    }

    async render() {
        var f = this.context.field;

        if (f.type === "email") {
            this.createEmailLookup()
        }

        await super.render();

        this.testDataList();


        switch (this.context.field.type) {
            case "color":
                this.container.classList.add("exf-std-lbl");
            case "hidden":
                this.container.classList.add("exf-hidden");
                break;
        }

        return this.container
    }

    createEmailLookup() {
        const _ = this;

        _.htmlElement.addEventListener("keyup", e => {
            if (e.key !== "Enter") {
                let data = [];

                ["@gmail.com", "@outlook.com", "@live.nl", "@yahoo.com", "@hotmail.com"].forEach(a => {
                    data.push(e.target.value.split('@')[0] + a);
                });

                if (data.length > 1) {
                    _.createDataList(_.context.field, data);
                }
                else {
                    _.destroyDataList()
                }
            }
            else {
                let dl = _.container.querySelector("datalist");
                if (dl) {
                    dl.remove();
                }
                e.preventDefault();
            }
        })
    }

    destroyDataList() {
        let dl = this.container.querySelector("datalist")
        if (dl) {
            dl.remove();
        }
    }

    testDataList() {
        const _ = this;

        let f = _.context.field;

        if (f.lookup) {
            if (Array.isArray(f.lookup)) {
                _.createDataList(f, f.lookup);
            }
            else {
                let query = (q) => {
                    // TODO: query REST 
                    let url = f.lookup.replace(".json", "_" + q + ".json");
                    url = new URL(url, _.context.baseUrl);

                    fetch(url).then(x => x.json()).then(data => {1
                        _.createDataList(f, data);
                    })
                };

                if (!Core.isValidUrl(f.lookup)) {
                    query = _.getFetchLookup(f);
                }

                this.htmlElement.addEventListener("keyup", e => {
                    query(f._control.htmlElement.value);
                })
            }
        }
    }

    getFetchLookup(f) {
        const _ = this;
        const exo = _.context.exo;

        const o = {
            field: f, type: "lookup", data: f.lookup, callback: (field, data) => {
                _.createDataList.call(_, field, data)
            }
        };

        if (o.data.type === "OpenData") { // TODO enhance
            return (q) => {
                q = q.substr(0, 1).toUpperCase() + q.substr(1);
                let url = o.data.url + "?$top=20&$filter=substring(" + o.data.field + ",0," + q.length + ") eq '" + q + "'";
                fetch(url).then(x => x.json()).then(data => {
                    if (data && data.value) {
                        o.callback(o.field, data.value.map(e => {
                            return e.Title
                        }));
                    }
                })
            }
        }

        return exo.options.get(o)
    }

    createDataList(f, data) {
        const _ = this;
        let id = f.id;
        f._control.htmlElement.setAttribute("list", "list-" + id);
        let dl = f._control.container.querySelector("datalist");
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
        f._control.container.appendChild(dataList);
    }
}

export default ExoInputControl;