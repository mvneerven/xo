const DOM = window.xo.dom;
const Core = window.xo.core;

import ULTabStrip from './ULTabStrip.js';

class ExoFormBuilderSidePanel {

    constructor(builder) {
        const _ = this;
        this.builder = builder;


        let containerPanel = _.builder.app.UI.areas.panel;

        this.tabStrip = new ULTabStrip("fieldTabs", {
            tabs: {
                settings: { caption: "Form", class: "full-height", enabled: true },
                addField: { caption: "Add", class: "full-height", enabled: false },
                properties: { caption: "Props", class: "full-height", enabled: false },
                model: { caption: "Model", class: "full-height", enabled: false },
                css: { caption: "CSS", class: "full-height", enabled: false }
            },
            class: "full-height"
        });

        this.tabStrip.on("tabSelected", e => {
            switch (e.detail.id) {
                case "addField":
                    this.tabStrip.tabs.addField.panel.querySelector("[name='_search']").focus();
                    break;
                case "model":

                    if(this.builder.currentForm){
                        this.showModelChange(this.builder.currentForm.dataBinding.model)
                    }
                    
                    break;
                default:
                    break;
            }
        })

        containerPanel.add(this.tabStrip.render());

        this.tabStrip.adaptHeight(containerPanel.element)


        let div = DOM.parseHTML(`<div title="Type to filter fields..." class="field-search exf-ctl-cnt"><input name="_search" type="search" placeholder="Search..." /></div>`)
        _.tabStrip.tabs.addField.panel.appendChild(div);

        let ul = _.getFieldMeta();
        _.tabStrip.tabs.addField.panel.appendChild(ul);
        div.addEventListener("input", e => {
            let s = e.target.value.toLowerCase();
            ul.querySelectorAll(':scope > li').forEach(li => {
                let ok = s === "" || li.innerText.toLowerCase().indexOf(s) > -1;
                li.style.display = ok ? "block" : "none";
            })

        })


        this.builder.renderCodeEditor({ mode: "json", id: "exo-datamodel", value: "" }).then(elm => {
            this.tabStrip.tabs.model.panel.appendChild(elm);
            this.tabStrip.tabs.model.enabled = true;
        })

        this.getSettings().then(x => {

            const update = e=>{
                this.tabStrip.tabs.addField.enabled = true;
                this.mapSettingsToModel();
            }

            this.builder.renderer.model.on("change", update);
            this.builder.renderer.on("created", update);

            _.tabStrip.tabs.settings.panel.appendChild(x.container);
            let form = _.tabStrip.tabs.settings.panel.querySelector("form");

            const bindMax = e => {
                form.querySelector("[name='page']").setAttribute("max", form.querySelector("[name='pages']").value);

                if (parseInt(form.querySelector("[name='page']").value) > parseInt(form.querySelector("[name='pages']").value)) {
                    form.querySelector("[name='pages']").value = form.querySelector("[name='page']").getAttribute("max");
                    DOM.trigger(form.querySelector("[name='pages']"), "change");
                }
            }


            form.addEventListener("change", e => {

                let name = e.target.name;
                if (name.startsWith("setting.")) {
                    let prop = name.split(".")[1];
                    _.builder.renderer.model.set(prop, e.target.value);

                }
                else {
                    switch (name) {
                        case "live-edit":
                            if (!_.builder.tabStrip.tabs.form.selected) {
                                _.builder.refreshForm("form");
                            }

                            if (_.builder.liveEditor) {
                                _.builder.liveEditor.enabled = e.target.value === "1";
                            }
                            break;
                        case "pages":
                            _.builder.renderer.model.pageCount = parseInt(e.target.value);
                            bindMax();

                            break;
                        case "page":
                            _.builder.renderer.model.page = parseInt(e.target.value);
                            break;
                    }
                }
            });

            bindMax();

            x.container.id = "exo-settings";
        })

        this.addDarkModeSwitch();
    }

    // update fields in form settings panel 
    // according to model
    mapSettingsToModel() {
        let model = this.builder.renderer.model;

        this.settingsForm.map(f => {

            if (f.name.startsWith("setting.")) {
                let name = f.name.substring(8)
                let v = model.get(name);
                if (v != null)
                    return v;
            }
            else {
                switch (f.name) {
                    case "pages":
                        let count = model.pageCount;
                        return count;
                    case "page":

                        f._control.htmlElement.max = model.pageCount;
                        return 1;
                }
            }
        })
    }

    showModelChange(model) {
        let elm = document.getElementById("exo-datamodel");
        if(elm){
            let f = window.xo.form.factory.getFieldFromElement(elm)
            if (f) {
                f._control.value = JSON.stringify(model, null, 2);
            }
        }
    }

    updateCurrentFormPage(index) {
        this.settingsForm.get("page")._control.value = index;
    }

    async addDarkModeSwitch() {
        let result = await this.builder.exoContext.renderSingleControl({
            "type": "switch",
            "id": "exo-dark-mode",
            "caption": "Dark Mode",
            "name": "dark",
            "value": this.builder.app.UI.theme === "dark"
        });

        this.builder.app.UI.areas.headerright.add(result);
        result.addEventListener("change", e => {
            let darkModeEl = e.target.closest("[data-id='exo-dark-mode']");

            if (darkModeEl) {
                let darkMode = darkModeEl.querySelector("input").value > 0;
                this.builder.app.UI.theme = darkMode ? "dark" : "light";

                DOM.trigger(document.body, "dark-mode", {
                    value: darkMode
                })
            }
        })

    }

    getFieldMeta() {
        const _ = this;
        const exoContext = _.builder.exoContext;

        const ul = document.createElement("ul");
        ul.classList.add("meta");
        ul.addEventListener("click", e => {

            let btn = e.target.closest(".add-field");
            if (btn) {
                e.preventDefault();
                let ex = e.target.closest(".example");
                if (ex && ex.innerText.length) {
                    navigator.clipboard.writeText(ex.innerText);
                    ex.classList.add("copied");
                    setTimeout(() => {
                        ex.classList.remove("copied");
                    }, 200);
                }
                else {
                    let v = e.target.closest(".field").querySelector(".example");

                    var obj = JSON.parse(v.innerText);

                    _.builder.renderer.model.add(obj);
                }

            }

            else {
                let fld = e.target.closest(".field");
                if (fld) {
                    fld.classList.toggle("selected");
                }
            }

        })

        let iter = new Core.Iterator(exoContext.library, "_key")

        var field, i = 0;
        while (field = iter.next()) {
            name = field._key;
            if (field.hidden) continue;

            let data = {
                ...field,
                name: name,
                description: field.note,
                type: field.type.name,
                example: field.example || field.demo
            }

            if (!data.example) {
                data.example = { type: data.name, name: data.name + "1" }
            }

            data.example = {
                type: data.name,
                name: field._key,
                caption: Core.toWords(data.name),
                ...data.example
            }

            data.example = JSON.stringify(data.example, null, 2).trim();

            let li = DOM.parseHTML(/*html*/`
                <li>
                    <div class="field">
                        <span class="type-name">${data.name}</span> <span title="HTML element rendered" class="field-element">${data.element}</span> 
                        <span class="type return-type" title="Return value type">${data.returns}</span>
                        <div class="notes field-description">${data.description}</div>
                        <ul></ul>
                        <div title="Click to copy to clipboard..." class="example"><pre>${data.example}</pre></div>
                        <div class="btn-cnt">
                            <button title="Add ${data.name} field to the Form" class="exf-btn add-field"><span class="ti-plus"></span></button>
                        <div>
                    </div>
                </li>`);

            let propsUl = document.createElement("ul");
            let propsDiv = document.createElement("div");
            li.querySelector("ul").appendChild(propsDiv);
            propsDiv.appendChild(propsUl)

            for (var name in field.properties) {
                let p = {
                    ...field.properties[name],
                    name: name
                }

                let s = /*html*/`
                    <li>
                        <span class="type-name">${p.name}</span> <span title="Property type" class="type">${p.type}</span>
                        <div class="notes prop-description">${p.description}</div>                       
                    </li>
                `;

                propsUl.appendChild(DOM.parseHTML(s))
            }
            ul.appendChild(li);

            i++;
        }
        return ul
    }

    async getSettings() {
        this.settingsForm = this.builder.exoContext.createForm({ host: this });

        await this.settingsForm.load(this.createFormSettingsForm());
        
        return this.settingsForm.renderForm();

    }

    getFields() {
        let ar = [];

        let meta = window.xo.form.factory.meta;
        for (var n in meta) {
            var cmp = meta[n];
            ar.push({
                type: "dropdown",
                name: "setting." + n,
                caption: Core.toWords(n),
                items: this.getItems(cmp.type.types)
            })
        }
        return ar;

    }

    getItems(meta) {

        let ar = [];

        for (var i in meta) {
            ar.push({
                name: i,
                value: i
            })
        }

        return ar;
    }

    createFormSettingsForm() {
        return {
            validation: "inline",
            navigation: "static",
            progress: "auto",
            pages: [
                {
                    legend: "Live Editor",
                    fields: [
                        {
                            type: "switch",
                            name: "live-edit",
                            id: "live-edit-switch1",
                            tooltip: "Toggle live editing",
                            value: false,
                            caption: "Enable"
                        }
                    ]
                },
                {
                    legend: "Schema Settings",
                    fields: this.getFields()
                },
                {
                    legend: "Pages",
                    fields: [
                        {
                            type: "number",
                            buttons: true,
                            name: "pages",
                            caption: "Pages",
                            value: 1,
                            step: 1,
                            min: 1,
                            max: 100
                        },
                        {
                            type: "range",
                            name: "page",
                            step: 1,
                            min: 1,
                            max: 100,
                            showoutput: true,
                            caption: "Current Page",
                            value: 1,
                            bindings: {
                                max: "page.pages.value"
                            }

                        }
                    ]
                }
            ]
        }
    }
}

export default ExoFormBuilderSidePanel;
