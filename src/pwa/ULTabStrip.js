import DOM from './DOM';

const html = document.querySelector("html");

class ULTab {

    constructor(tabStrip, tabOptions) {
        this.tabStrip = tabStrip;

        this.tabOptions = tabOptions;
        if (this.tabOptions.enabled === undefined)
            this.tabOptions.enabled = true;
    }

    render() {
        let opts = {
            ...this.tabOptions,
            index: this.tabOptions.index.toString(),
            name: this.tabStrip.name
        }

        let tabString = this.getTabTemplate(opts);

        this.tab = DOM.parseHTML(tabString);

        this.enabled = this.tabOptions.enabled;

        if (this.tabOptions.active) {
            this.tab.querySelector("input").setAttribute("checked", "checked");
        }

        this.panel = this.tab.querySelector('div');
        return this.tab;
    }

    getTabTemplate(opts){
        return /*html*/`<li>
        <input type="radio" name="${opts.name}" ${opts.checked} id="${opts.name}-${opts.id}" /><label
            for="${opts.name}-${opts.id}" title="${opts.tooltip || ""}">${opts.caption}</label>
        <div class="${opts.class}"></div>
        </li>`
    }

    get enabled() {
        return this.tabOptions.enabled;
    }

    set enabled(value) {
        this.tabOptions.enabled = value;
        if (!this.tabOptions.enabled) {
            this.tab.querySelector("input").setAttribute("disabled", "disabled");
        }
        else {
            this.tab.querySelector("input").removeAttribute("disabled");
            this.tab.querySelector("input").disabled = false;
        }
    }

    replaceWith(elm) {
        this.panel.innerHTML = "";
        this.panel.appendChild(elm);
    }


    select() {
        if (!this.tabOptions.enabled)
            throw TypeError("Tab " + this.tabOptions.id + " is disabled");

        let tabInput = this.tabStrip.container.querySelector('#' + this.tabStrip.name + "-" + this.tabOptions.id);
        tabInput.checked = true
    }

    get selected(){
        let tabInput = this.tabStrip.container.querySelector('#' + this.tabStrip.name + "-" + this.tabOptions.id);
        return tabInput.checked;
    }
}

class ULTabStrip {

    static ULTab = ULTab

    containerTemplate =
/*html*/`<div class="ul-tabs {{class}}" data-name="{{name}}">
    <ul></ul>
</div>`;

    tabs = {}

    constructor(name, settings) {
        if (!name) throw TypeError("Need name for ULTabStrip");
        this.name = name;

        settings = settings || {
            tabs: {
                first: { caption: "First tab" }
            }
        }

        this.container = DOM.parseHTML(DOM.format(this.containerTemplate, {
            name: this.name,
            class: settings.class || ""
        }));

        let index = 0;
        for (var id in settings.tabs) {
            let tabSettings = settings.tabs[id];

            tabSettings = {
                id: id,
                enabled: true,
                active: index === 0,
                caption: tabSettings.caption,
                index: index,
                ...(tabSettings || {})
            }
            let tab = new ULTab(this, tabSettings);
            this.tabs[id] = tab;
            index++;
        }
    }


    on(eventName, func) {
        this.events = this.events || {};
        this.events[eventName] = func;
        return this;
    }

    isThisTabStrip(elm) {
        try {
            let div = elm.parentElement.parentElement.parentElement;
            if (div && div.classList.contains("ul-tabs")) {
                if (elm.id && elm.id.split('-')[0] === div.getAttribute('data-name'))
                    return true;
            }

        }
        catch { }
    }

    render() {
        let ul = this.container.querySelector('ul');

        var isTabSet = false;
        for (var tabName in this.tabs) {
            if (!isTabSet) {
                this.setHtmlElementClass(tabName);
                isTabSet = true;
            }
            ul.appendChild(this.tabs[tabName].render());
        }

        this.container.addEventListener("change", e => {

            if (!this.isThisTabStrip(e.target))
                return;

            let child = e.target;
            let p = child.id.lastIndexOf('-');
            let id = child.id.substring(p + 1);
            console.debug("Tab selected on tabStrip '" + this.name + "': " + id)
            if (this.events && this.events["tabSelected"]) {
                let tab = null
                for (var t in this.tabs) {
                    if (t === id) {
                        tab = this.tabs[t];
                        break;
                    }
                }

                this.setHtmlElementClass(id);

                this.events["tabSelected"].apply(this, [{
                    target: e.target,
                    detail: {
                        index: tab.tabOptions.index,
                        id: id,
                        tab: tab
                    }
                }])
            };
        })
        
        this.adaptHeight(this.container)

        return this.container;
    }

    // fix full height
    adaptHeight(cn) {
        const _ = this;
        let ctn = cn.parentNode;
        let ulH = ctn.querySelector(".ul-tabs > ul").clientHeight;
        new ResizeObserver(e=>{
            let ch = e[0].contentRect.height-10;
            let h = (ch - ulH)
            ctn.querySelectorAll(".ul-tabs div.full-height").forEach(c=>{
                c.style.height = h + "px";
            })
        }).observe(ctn);
    }

    setHtmlElementClass(tabId) {

        // let prefix = "exb-tab-" + this.name + "-";

        // let tabClass = prefix + tabId;

        // html.classList.forEach(c => {
        //     if (c.startsWith(prefix)) {
        //         html.classList.remove(c)
        //     }
        // })
        // html.classList.add(tabClass)
    }
}

export default ULTabStrip;