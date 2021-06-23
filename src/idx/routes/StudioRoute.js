import ULTabStrip from '../modules/ULTabStrip';
import ExoFormLiveEditor from '../modules/ExoFormLiveEditor';
import StyleSheetHelper from '../modules/StyleSheetHelper';
import ExoFormBuilderSidePanel from '../modules/ExoFormBuilderSidePanel';
import ExoFormBuilderSchema from '../modules/ExoFormBuilderSchema';
import ExoSchemaRenderer from '../modules/ExoSchemaRenderer';
import ExoFormBuilderWorkspace from '../modules/ExoFormBuilderWorkspace';
import ExoFormAceExtension from '../modules/ExoFormAceExtension';

const DOM = window.xo.dom;
const Core = window.xo.core;

class StudioRoute extends xo.route {

    title = "Studio"
    menuIcon = "ti-panel";

    async asyncInit() {
        this.workspace = new ExoFormBuilderWorkspace(this);

        this.exoContext = await this.buildExoFormContext();

        // main rendering of current schema tab
        this.renderer = new ExoSchemaRenderer(this);

        this.renderer.on("created", e => {
            this.applyJSLogic(e.detail.exo);
        }).on("ready", e => { // form rendered using current schema tab contents
            this.rendered(e.detail);

        }).on("schemaloaded", e => {
            if (this.renderer.model.fieldCount === 0) {
                this.showFormNotRendered({
                    title: "Nothing to render",
                    body: "Empty schema/no fields rendered",
                    icon: "ti-na"
                });


            }
        }).on("error", e => {

            this.app.UI.notifications.add("Error " + e.detail.error.toString(), { type: "error" })
        }).on("post", e => {
            //let jsonString = JSON.stringify(e.detail.postData, null, 2);
            //alert(jsonString);
        });

        this.renderer.model.on("change", e => {

            this.loadSchemaInEditor(this.renderer.model.schema);
            this.refreshForm();

        }).on("page", e => {
            this.currentForm.addins.navigation.goto(this.renderer.model.page)
        })


    }

    showFormNotRendered(data) {
        data = {
            icon: "ti-info",
            title: "Form not rendered",
            body: "No details",
            ...data || {}
        }
        this.tabStrip.tabs.form.replaceWith(
            DOM.parseHTML(
                /*html*/`<div class="xos-info"><h2><span class="${data.icon}"></span> ${data.title}</h2><p>${data.body}</p></div>`));
    }

    async buildExoFormContext() {
        const factory = window.xo.form.factory;

        const context = await factory.build({
            defaults: {
                validation: "inline"
            }
        });

        ExoFormAceExtension.extend(context)

        return context;

    }

    render(path) {
        this.app.UI.areas.main.clear()

        this.styleSheetHelper = new StyleSheetHelper(this);
        this.sidePanel = new ExoFormBuilderSidePanel(this);
        this.setupTabStrip();

        this.showFormExplorer()

        if (this.renderer.cache) {
            try {
                this.renderer.restoreCache();
            }
            catch (ex) {
                this.showFormNotRendered({
                    icon: "ti-face-sad",
                    title: "Cache contains invalid schema",
                    body: ex.toString()
                })
            }
        }

        new ExoFormBuilderSchema(this).render(this.tabStrip.tabs.start.panel);
    }

    // when current schema in editor is rendered
    async rendered(o) {
        let x = o.exo;

        this.sidePanel.tabStrip.tabs.css.enabled = true;
        this.tabStrip.tabs.js.enabled = true;

        this.htmlEditor.value = DOM.prettyPrintHTML(x.container.outerHTML);
        this.tabStrip.tabs.html.enabled = true;

        this.tabStrip.tabs.form.replaceWith(x.container);

        this.currentForm = x;
        console.debug("Showing Model instance at render time");
        this.sidePanel.showModelChange(x.dataBinding.model)

        // when paging in rendered form, update sidepanel
        this.currentForm.on(window.xo.form.factory.events.page, e => {
            this.sidePanel.updateCurrentFormPage(e.detail.page);
        }).on(window.xo.form.factory.events.dataModelChange, e => {
            console.debug("ExoFormsStudio", "dataModelChange", e.detail.state, e.detail.model);
            this.sidePanel.showModelChange(e.detail.model)
        })

        x.container.setAttribute("id", "xfb");
        this.liveEditor = new ExoFormLiveEditor(this, x.container);

        this.liveEditor.on("field-props", e => {

            let tab = this.sidePanel.tabStrip.tabs.properties;
            tab.enabled = true;
            tab.select();

            if (!this.app.UI.areas.panel.pinned) {
                this.app.UI.areas.panel.pinned = true;
            }
            this.showFieldEditor(tab, e.detail.field)

        }).on("enable", e => {

            //this.refreshForm();
            //this.tabStrip.tabs.form.select();
        })
    }

    applyJSLogic(x) {
        let js;
        try {
            js = this.getJSCode();
            Core.scopeEval(x, js)
        }
        catch (ex) {
            console.error(ex);
        }
        finally {
            this.workspace.set("xo-script", js)
        }
    }

    getJSCode() {
        let elm = document.getElementById("js-code");
        let fld = window.xo.form.factory.getFieldFromElement(elm);
        return fld ? fld._control.value : "";

    }

    setupTabStrip() {
        
        this.tabStrip = new ULTabStrip("exploreTabs", {
            tabs: {
                start: { caption: "Start", class: "full-height", tooltip: "Select a templates or import DTO to generate an ExoForm Schema with" },
                schema: { caption: "Schema", class: "full-height", tooltip: "Edit ExoForm Schema" },
                form: { caption: "Form", class: "full-height", tooltip: "View rendered form" },
                html: { caption: "HTML", class: "full-height", enabled: false, tooltip: "Show generated form HTML" },
                js: { caption: "JS", class: "full-height", tooltip: "Add JavaScript to execute" } 
            },
            class: "full-height"
        });

        this.tabStrip.on("tabSelected", e => {

            this.styleSheetHelper.removeCSS();

            switch (e.detail.id) {
                case "form":
                    let o = this.mainExoForm.getFormValues(e);

                    // save last edits in workspace
                    this.workspace.set("xo-schema", o.schema)

                    this.renderFormFromSchema(o.schema);

                    break;
                default:
                    break;
            }

            this.prevTab = e.detail.id;
        })

        this.app.UI.areas.main.add(this.tabStrip.render());

        this.tabStrip.adaptHeight(this.app.UI.areas.main.element)
    }

    unload() {
        this.app.UI.areas.main.clear();
        this.app.UI.areas.panel.clear();
    }

    showMenu() {
        const _ = this;

        const ul = DOM.parseHTML('<ul class="li-tiles"/>');
        const tpl = /*html*/`<li class="btn"><a href="#{{basepath}}{{path}}">{{title}}</a></li>`;

        _.app.UI.areas.main.add(DOM.parseHTML('<h2>Explore</h2'));

        [
            {
                basepath: _.path,
                title: "Field Explorer",
                path: "/fields"
            },
            {
                basepath: _.path,
                title: "Form Explorer",
                path: "/form"
            }
        ].forEach(i => {
            ul.appendChild(DOM.parseHTML(DOM.format(tpl, i)))
        })
        _.app.UI.areas.main.add(ul);

    }

    async renderCodeEditor(options) {
        let elm = await this.exoContext.renderSingleControl({
            type: "aceeditor",
            class: "full-height",
            ...options
        });
        return elm;
    }

    renderFormFromSchema(value, ready) {
        try {
            this.renderer.model.load(value);

            try {
                this.renderer.render();
            }
            catch (ex) {
                this.showFormNotRendered({
                    icon: "ti-face-sad",
                    title: "Form not rendered",
                    body: ex.toString()
                })
            }

        }
        catch (ex) {
            this.showFormNotRendered({
                icon: "ti-face-sad",
                title: "Form could not be loaded",
                body: ex.toString()
            })
        }


    }

    refreshForm(tabName, ready) {
        this.renderer.render()
    }

    async showFieldEditor(tab, field) {
        const _ = this;

        tab.panel.innerHTML = "";

        let context = _.sidePanel.builder.exoContext;
        let meta = context.library[field.type].properties;

        let generator = context.createGenerator();

        var schema = {
            pages: [{
                fields: []
            }]
        };

        for (var m in meta) {
            var fieldSchema = generator.getMatchingFieldSettingsFuzzy(m, field[m], meta[m]);

            fieldSchema.name = m;
            let value = field[m];

            if (value === undefined) {
                value = meta[m].type === "boolean" ? false : ""
            }

            fieldSchema.value = value;

            schema.pages[0].fields.push(fieldSchema);
        }

        let xf = context.createForm();
        await xf.load(schema);
        let x = await xf.renderForm();

        tab.panel.appendChild(x.container)
    }

    loadSchemaInEditor(schema) {
        if (this.xo_schemaControl) {
            this.xo_schemaControl.mode = this.renderer.model.type;
            this.xo_schemaControl.schema = schema;
        }
        else
            console.warn("No xo schema editor")
    }

    showFormExplorer() {

        const exo = this.exoContext.createForm({

            customMethods: {
                renderLiveEdit: (o) => {
                    this.renderArea = document.querySelector("[data-id='rendered']");
                    this.renderArea.innerHTML = "";
                    let value = DOM.getValue(o.dependency);
                    this.renderFormFromSchema(value)
                }
            }
        }).on("post", e => {
            this.renderFormFromSchema(e.detail.postData.schema);
        });

        this.mainExoForm = exo;

        const schemaEditForm = {
            form: {
                id: "frm-expl",
                class: "form-explorer full-height"
            },

            pages: [
                {
                    class: "full-height",
                    fields: [
                        {
                            id: "schema-editor",
                            name: "schema",
                            type: "xo_schema",
                            class: "code full-height",
                            mode: "json"
                        }
                    ]
                }
            ]
        }

        exo.load(schemaEditForm).then(x => x.renderForm()).then(x => {
            this.tabStrip.tabs.schema.panel.appendChild(x.container);

            this.schemafield = x.get("schema");
            this.xo_schemaControl = this.schemafield._control

            this.loadSchemaInEditor(this.getCurrentSchema())

            this.app.on("pwa.theme", e => { // to all ACE editors
                if (this.schemafield) {
                    let aceEditor = this.schemafield._control;
                    let theme = e.detail.theme === "dark" ?
                        aceEditor.defaultThemes.dark :
                        aceEditor.defaultThemes.light;
                    aceEditor.htmlElement.data.editor.setTheme("ace/theme/" + theme);
                }
            })
            // if a cached schema was loaded, go directly to the schema tab
            if (this.renderer.model.cacheFound) {
                this.tabStrip.tabs.schema.select();
            }
        });

        this.renderCssTab()

        this.renderJsTab()

        this.renderHtmlTab() 

    }

    renderCssTab(){
        this.renderCodeEditor({ mode: "css", value: this.styleSheetHelper.buildCssFromClasses() }).then(e => {

            e.querySelector("[data-exf]").data.editor.on("change", ev => {
                this.styleSheetHelper.applyCSS();
            })
            this.sidePanel.tabStrip.tabs.css.replaceWith(e);
        });
    }

    renderHtmlTab(){
        this.renderCodeEditor({ mode: "html" }).then(htmlEditor => {
            this.tabStrip.tabs.html.replaceWith(htmlEditor);
            this.htmlEditor = xo.form.factory.getFieldFromElement(htmlEditor)._control;
        })
    }

    renderJsTab(){
        var ar = []
        for (var ev in window.xo.form.factory.events) {
            ar.push(
                `this.on("${ev}", e => {
    //console.log('>> ExoForm Event: ${ev}", e.detail);
    })`)
        } 

        const defaultScript = `
    // Add your logic here...
    
    ` + ar.join('\n\n');

        let js = this.workspace.get("xo-script") || defaultScript;

        this.renderCodeEditor({ mode: "javascript", value: js, id: "js-code" }).then(e => {
            this.tabStrip.tabs.js.replaceWith(e);
        });
    }

    getCurrentSchema() {
        // if a cached schema exists, use this
        let schema = this.renderer.model.cacheFound ? this.renderer.model.rawData : {
            pages: [{
                legend: "My Form",
                intro: "My form description",
                fields: [{
                    name: "testField",
                    caption: "Test Field",
                    type: "text"
                }]
            }]
        };
        return schema;
    }
}

export default StudioRoute;