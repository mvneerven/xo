import DOM from '../pwa/DOM';
import Core from '../pwa/Core';

class MarkDownCMS {
    tree = {};

    index = {};

    homeUrl = null;

    _ready = false;

    async load(path) {
        if (path.startsWith("."))
            path = path.substr(1);

        this.tree[path] = {
            title: "Home"
        };
        await this.readMd(this.tree[path], path);
        this._ready = true;
        return this.tree;
    }

    get ready() {
        return this._ready;
    }

    async readMd(node, path) {
        if (path.startsWith("."))
            path = path.substr(1);

        node.url = path;
        if (this.homeUrl === null)
            this.homeUrl = node.url;

        if (this.index[node.url]) {
            //debugger;
            return;
        }


        node.path = this.getBasePath(path);
        node.html = await Core.MarkDown.read(path);
        let elm = DOM.parseHTML(node.html);
        node.children = {};
        await this.addIndex(node, elm);
        await this.getChildren(node, elm);
    }

    async getChildren(node, elm) {
        let links = elm.querySelectorAll("a[href]");
        for (const a of links) {
            if (a.href.endsWith(".md")) {
                let link = node.path + new URL(a.href).pathname;
                a.setAttribute("href", "#/docs" + link)
                node.children[link] = {
                    title: a.innerText
                }
                await this.readMd(node.children[link], link, this.index);
            }
        };
    }

    addIndex(node, elm) {
        let s = [node.title];
        elm.querySelectorAll("h1,h2,h3").forEach(h => {
            s.push(h.innerText);
        })

        this.index[node.url] = {
            text: s,
            node: node
        }
    }

    getBasePath(path) {
        let d = path.split("/");
        d.length--;
        let s = d.join("/");
        return s;
    }

    async get(url) {

        await Core.waitFor(() => {
            return this.ready
        }, 5000, 100);

        if (!url)
            url = this.homeUrl;

        let item = this.index[url]
        if (!item)
            throw TypeError("Not found: " + url);

        return item.node;

    }

    find(search) {
        search = search.toLowerCase();
        let ar = [];
        for (var url in this.index) {
            let item = this.index[url];
            item.text.filter(i => {
                return i.toLowerCase().indexOf(search) > -1;
            }).forEach(i => {
                let res = {
                    url: url,
                    node: item.node
                }
                if (!ar.find(i => {
                    return i.url === res.url
                }))
                    ar.push(res)
            })
        }
        return ar;
    }
}

export default MarkDownCMS;