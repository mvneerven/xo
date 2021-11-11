import DOM from '../pwa/DOM';
import Core from '../pwa/Core';

class MarkDownCMS {
    tree = {};

    index = {};

    homeUrl = null;

    _ready = false;

    async load(path) {
        if (path.startsWith("./"))
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
        if (path.startsWith("./"))
            path = path.substr(1);

        if (this.index[path])
            return;

        node.url = path;

        if (this.homeUrl === null)
            this.homeUrl = node.url;

        node.path = this.getBasePath(path);
        node.html = await Core.MarkDown.read(path);
        let elm = DOM.parseHTML(node.html);
        node.children = {};
        await this.addIndex(node, elm);
        await this.getChildren(node, elm);

        this.correctImageLinks(elm)

        node.html = elm.outerHTML; // update HTML to reflect modified paths
    }

    correctImageLinks(elm){
        for (const i of elm.querySelectorAll("img[src]")) {
            let u = i.getAttribute("src");
            if (u.indexOf("//") === -1) {
                let link = "/md/refdocs/" + u;
                i.setAttribute("src", link)
            }
        };
    }

    async getChildren(node, elm) {
        
        const prefix = this.options?.routerType === "hash" ? "#/docs" : "/docs";
        let links = elm.querySelectorAll("a[href]");
        for (const a of links) {
            if (a.href.endsWith(".md")) {

                let link = this.resolveLink(node, a);

                a.setAttribute("href", prefix + link)
                node.children[link] = {
                    title: a.innerText
                }
                await this.readMd(node.children[link], link, this.index);
            }
        };
    }

    resolveLink(node, a){
        let path = a.getAttribute("href"), link;

        try{
            link = new URL(node.path + "/" + path, document.location.origin).pathname;
            
            return link;
        }

        catch(ex){
            console.error(link, ex)
        }

    }

    addIndex(node, elm) {
        let s = [{
            t: 0, v: node.title
        }];
        let firstH1Found = false;
        elm.querySelectorAll("h1,h2,h3").forEach(h => {
            let type = parseInt(h.nodeName.substr(1));
            if (type === 1 && !firstH1Found) {
                firstH1Found = true;
                type = 0;
            }
            s.push({
                t: type, v: h.innerText
            });
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
                return i.v.toLowerCase().indexOf(search) > -1;
            }).forEach(i => {

                let res = {
                    url: url,
                    node: item.node,
                    title: i.v,
                    description: item.title,
                    type: i.t
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