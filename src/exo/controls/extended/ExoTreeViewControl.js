import Core from "../../../pwa/Core";
import DOM from "../../../pwa/DOM";
import ExoDivControl from "../base/ExoDivControl";

class ExoTreeViewControl extends ExoDivControl {
    options = {
        rootClass: "c-tree",
        Url: null
    }

    set items(treeObj) {
        this._items = treeObj
    }

    constructor() {
        super(...arguments)

        this.acceptProperties(
            {
                name: "items",
                type: Object | Array
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

    async render() {
        await super.render();

        let elm = this.htmlElement
        elm.classList.add("exf-treeview");

        let level = 0;

        const add = (ul, item) => {
            let li = DOM.parseHTML(`<li data-id="${item.id}">${item.title}</li>`)
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
        }


        let root = document.createElement('ul')
        root.classList.add(this.options.rootClass)
        elm.appendChild(root);

        let obj = await this.getData(this._items);
        add(root, obj);


        elm.addEventListener("click", (e) => {
            let tgt = e.target,
                li = tgt.closest("li"),
                ul = tgt.querySelector("ul");

            if (!li)
                return;

            if (ul) {
                ul.style.display = ul.style.display === 'block' ? 'none' : 'block'
                li.classList.toggle("expanded");
            }
            else if (!li.classList.contains("tv-empty") && !li.querySelector(".tv-empty")) {
                li.appendChild(DOM.parseHTML('<ul><li class="tv-empty">(empty)</li></ul>'));
            }

            DOM.trigger(elm, "open", { selected: li })
        });

        return this.container
    }
}


export default ExoTreeViewControl