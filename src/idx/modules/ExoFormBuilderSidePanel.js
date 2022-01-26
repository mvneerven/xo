class ExoFormBuilderSidePanel {

    constructor(builder) {
        const _ = this;
        this.builder = builder;


        let containerPanel = _.builder.app.UI.areas.panel;

        let tsOptions = {
            tabs: {
                settings: { caption: "Options", class: "full-height", enabled: true },
                addField: { caption: "Add", class: "full-height", enabled: false },
                dataTab: { caption: "Data", class: "full-height", enabled: true },
            },
            class: "full-height"
        }

        if (localStorage.advancedUi === "On") {
            tsOptions.tabs = {
                ...tsOptions.tabs,
                css: { caption: "CSS", class: "full-height", enabled: false }

            }
        }


        this.tabStrip = new xo.pwa.TabStrip("fieldTabs", tsOptions);

        this.tabStrip.on("tabSelected", e => {
            switch (e.detail.id) {
                case "addField":
                    this.tabStrip.tabs.addField.panel.querySelector("[name='_search']").focus();
                    break;

                default:
                    break;
            }
        })

        this.renderPanel = document.createElement("div");
        this.renderPanel.classList.add("render-panel");
        containerPanel.add(this.renderPanel)

        containerPanel.add(this.tabStrip.render());

        let div = xo.dom.parseHTML(`<div title="Type to filter fields..." class="field-search exf-ctl-cnt"><input name="_search" type="search" placeholder="Search..." /></div>`)
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

        if (this.tabStrip.tabs.dataTab) {
            this.builder.renderCodeEditor(
                { mode: "json", readOnly: true, id: "exo-datamodel", value: "" }
            ).then(elm => {
                this.builder.formDataViewer = xo.control.get(elm);
                this.tabStrip.tabs.dataTab.panel.appendChild(elm);
            })
        }

        this.getSettings().then(x => {

            const update = e => {
                this.tabStrip.tabs.addField.enabled = true;
                this.mapSettingsToModel();
            }

            this.builder.renderer.model.on("change", update);
            this.builder.renderer.on("created", update);

            _.tabStrip.tabs.settings.panel.appendChild(x.container);
            let form = _.tabStrip.tabs.settings.panel.querySelector("form");

            const bindMax = e => {
                let pageInput = form.querySelector("[name='page']");
                if (!pageInput)
                    return;
                pageInput.setAttribute("max", form.querySelector("[name='pages']").value);

                if (parseInt(form.querySelector("[name='page']").value) > parseInt(form.querySelector("[name='pages']").value)) {
                    form.querySelector("[name='pages']").value = form.querySelector("[name='page']").getAttribute("max");
                    xo.dom.trigger(form.querySelector("[name='pages']"), "change");
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
    }

    // update fields in form settings panel according to model
    mapSettingsToModel() {
        let model = this.builder.renderer.model;

        this.settingsForm.all().forEach(control=>{
            if (control.name?.startsWith("setting.")) {
                let name = control.name.substring(8)
                let v = model.get(name);
                if (v != null)
                    control.value = v;
            }
            else {
                switch (control.name) {
                    case "pages":
                        let count = model.pageCount;
                        control.value = count;
                    case "page":

                        control.htmlElement.max = model.pageCount;
                        control.value = 1;
                }
            }
        });

        
    }

    updateCurrentFormPage(index) {
        this.settingsForm.get("page").value = index;
    }

    getFieldMeta() {

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
                    this.builder.renderer.model.add(obj);
                }
            }
            else {
                let fld = e.target.closest(".field");
                if (fld) {
                    fld.classList.toggle("selected");
                }
            }

        })

        xo.form.factory.extractControlMeta(this.builder.exoContext.library).forEach(data => {
            let li = xo.dom.parseHTML(/*html*/`
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


            for (var name in data.properties) {
                let p = {
                    ...data.properties[name],
                    name: name
                }

                let s = /*html*/`
                    <li>
                        <span class="type-name">${p.name}</span> <span title="Property type" class="type">${p.type}</span>
                        <div class="notes prop-description">${p.description}</div>                       
                    </li>
                `;

                propsUl.appendChild(xo.dom.parseHTML(s))
            }
            ul.appendChild(li);

        })


        return ul
    }

    async getSettings() {
        this.settingsForm = this.builder.exoContext.createForm({ host: this });
        await this.settingsForm.load(this.createFormSettingsForm());
        return this.settingsForm.renderForm();
    }

    getFields() {
        let ar = [];

        let meta = xo.form.factory.meta;
        for (var n in meta) {
            var cmp = meta[n];
            ar.push({
                type: "dropdown",
                name: "setting." + n,
                caption: xo.core.toWords(n),
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
                            value: 1
                        }
                    ]
                }
            ]
        }
    }
}

export default ExoFormBuilderSidePanel;
