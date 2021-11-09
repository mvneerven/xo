//import ExoFormLiveEditor from '../modules/ExoFormLiveEditor';
import StyleSheetHelper from '../modules/StyleSheetHelper';
import ExoFormBuilderSidePanel from '../modules/ExoFormBuilderSidePanel';
import ExoFormBuilderSchema from '../modules/ExoFormBuilderSchema';
import ExoSchemaRenderer from '../modules/ExoSchemaRenderer';
import ExoFormBuilderWorkspace from '../modules/ExoFormBuilderWorkspace';

const DOM = window.xo.dom;
const Core = window.xo.core;

class StudioRoute extends xo.route {

    menuTitle = "Studio"

    title = "XO Studio";

    menuIcon = "ti-panel";

    async asyncInit() {
        window.studioRoute = this;

        this.workspace = new ExoFormBuilderWorkspace(this);

        this.exoContext = await this.buildExoFormContext();

        // main rendering of current schema tab
        this.renderer = new ExoSchemaRenderer(this);

        this.renderer
        .on("created", e => {
            this.applyJSLogic(e.detail.exo);
        })
        .on("ready", e => { // form rendered using current schema tab contents
            this.rendered(e.detail);
        })
        .on("schemaloaded", e => {
            if (this.renderer.model.fieldCount === 0) {
                this.showFormNotRendered({
                    title: "Nothing to render",
                    body: "Empty schema/no fields rendered",
                    icon: "ti-na"
                });


            }
        })
        .on("error", e => {
            this.setError(e)
            //this.app.UI.notifications.add("Error " + e.detail.error.toString(), { type: "error" })
        })
        .on("dataChange", e => {
            this.sidePanel.tabStrip.tabs.dataTab.select()
            this.formDataViewer.value = JSON.stringify(
                this.renderer.data
                , null, 2);
        });

        this.renderer.model.on("change", e => {

            this.loadSchemaInEditor(this.renderer.model.schema);
            this.refreshForm();

        }).on("page", e => {
            this.currentForm.addins.navigation.goto(this.renderer.model.page)
        })

        window.onunhandledrejection = function (error) {
            
            studioRoute.showFormNotRendered({
                title: "Nothing to render",
                body: error?.reason || "Empty schema/no fields rendered",
                icon: "ti-na"
            });
          };
    }


    clearError() {
        this.recentError = null;
        //this.sidePanel.tabStrip.tabs.errors.panel.innerHTML=""
    }

    setError(e) {
        this.recentError = e.detail.error.toString();

        // let elm = document.createElement("div");
        // elm.innerHTML = this.recentError;
        // this.sidePanel.tabStrip.tabs.errors.panel.appendChild(elm);
        // this.sidePanel.tabStrip.tabs.errors.select()
    }

    showFormNotRendered(data) {
        data = {
            icon: "ti-info",
            title: "Form not rendered",
            body: "No details",
            ...data || {}
        }
        this.sidePanel.renderPanel.innerHTML = "";
        this.sidePanel.renderPanel.appendChild(
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
        return context;
    }

    render(path) {

        const me = this;

        this.app.UI.areas.main.clear()

        this.styleSheetHelper = new StyleSheetHelper(this);
        this.sidePanel = new ExoFormBuilderSidePanel(this);
        this.setupTabStrip();

        this.showFormExplorer()

        if (path) {
            this.tryOpenPassedSchemaUrl(path)
        }

        else if (this.renderer.cache) {
            try {
                this.renderer.restoreCache();
            }
            catch (ex) {
                me.showFormNotRendered({
                    icon: "ti-face-sad",
                    title: "Cache contains invalid schema",
                    body: ex.toString()
                })
            }
        }

        new ExoFormBuilderSchema(this).render(this.tabStrip.tabs.start.panel);


    }

    tryOpenPassedSchemaUrl(path) {
        let url = path.substr(1);
        if (Core.isUrl(url)) {
            fetch(url).then(x => x.text()).then(text => {
                this.loadSchemaInEditor(text);
                this.renderer.model.load(text);
                this.tabStrip.tabs.schema.select();
                DOM.changeHash("/studio")
            }).catch(ex => {
                console.error(ex)
            })
        }
    }

    // when current schema in editor is rendered
    async rendered(o) {
        let x = o.exo;

        if(!o.form){
            throw TypeError("Form not rendered")
        }
            

        if (this.sidePanel.tabStrip.tabs.css)
            this.sidePanel.tabStrip.tabs.css.enabled = true;

        if (this.tabStrip.tabs.js)
            this.tabStrip.tabs.js.enabled = true;

        //this.tabStrip.tabs.form.replaceWith(o.form);
        //this.sidePanel.tabStrip.tabs.live.replaceWith(o.form);
        this.sidePanel.renderPanel.innerHTML = "";
        this.sidePanel.renderPanel.appendChild(o.form);

        this.currentForm = x;
        //this.sidePanel.showModelChange(x.dataBinding.model)

        // when paging in rendered form, update sidepanel
        this.currentForm.on(window.xo.form.factory.events.page, e => {
            this.sidePanel.updateCurrentFormPage(e.detail.page);
        })

        // .on("dataModelChange", e => {
        //     //console.debug("XO Studio", "dataModelChange", e.detail.state, e.detail.model);
        //     //this.sidePanel.showModelChange(e.detail.model)
        // })

        //x.container.setAttribute("id", "xfb");
        this.addLiveEdit(x)
    }

    addLiveEdit(exo) {
        this.liveEditor = new xo.form.factory.LiveEditor(exo).on("schema-change", e => {
            this.loadSchemaInEditor(e.detail.schema.toString())
        })
        exo.container.parentNode
    }

    applyJSLogic(x) {
        let js;
        try {
            js = this.getJSCode();
            if (js)
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
        if (!elm)
            return null;

        let fld = window.xo.form.factory.getFieldFromElement(elm);
        return fld ? fld._control.value : "";

    }

    setupTabStrip() {

        let tsOptions = {
            tabs: {
                start: { caption: "Start", class: "full-height", tooltip: "Select a templates or import DTO to generate an XO form Schema with" },
                schema: { caption: "Schema", class: "full-height", tooltip: "Edit XO form Schema" },
                //form: { caption: "▷ Run", class: "full-height", tooltip: "Run schema & view generated form" }

            },
            class: "full-height"
        }
        if (localStorage.advancedUi == "On") {
            tsOptions.tabs = {
                ...tsOptions.tabs,
                //html: { caption: "HTML", class: "full-height", enabled: false, tooltip: "Show generated form HTML" },
                //js: { caption: "JS", class: "full-height", tooltip: "Add JavaScript to execute" }
            }
        }

        this.tabStrip = new xo.pwa.TabStrip("exploreTabs", tsOptions);

        this.tabStrip.on("tabSelected", e => {

            //this.styleSheetHelper.removeCSS();

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

        //this.tabStrip.adaptHeight(this.app.UI.areas.main.element)
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

    async renderFormFromSchema(value, ready) {
        try {
            this.clearError()
            this.renderer.model.load(value);

            try {
                await this.renderer.render();
            }
            catch (ex) {
                let friendlyError = xo.form.err(ex, this.renderer.exo)
                this.showFormNotRendered({
                    icon: "ti-face-sad",
                    title: "Form not rendered",
                    body: friendlyError.toString()
                })
            }

        }
        catch (ex) {

            
            let friendlyError = xo.form.err(ex, this.renderer.exo)

            this.showFormNotRendered({
                icon: "ti-face-sad",
                title: "An error occurred",
                body: friendlyError.toString()
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
            this.xo_schemaControl.value = schema;// schema = schema;
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
                            type: "xoformeditor",
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
            this.xo_schemaControl.on("SchemaReady", e => {
                let value = this.xo_schemaControl.value
                this.workspace.set("xo-schema", value)
                this.renderFormFromSchema(value);

            })

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

        //this.renderHtmlTab()

    }

    renderCssTab() {
        if (!this.sidePanel.tabStrip.tabs.css)
            return;

        this.renderCodeEditor({ mode: "css", value: this.styleSheetHelper.buildCssFromClasses() }).then(e => {

            e.querySelector("[data-exf]").data.editor.on("change", ev => {
                this.styleSheetHelper.applyCSS();
            })
            this.sidePanel.tabStrip.tabs.css.replaceWith(e);
        });
    }

    renderJsTab() {
        if (!this.tabStrip.tabs.js)
            return;

        var ar = []
        for (var ev in window.xo.form.factory.events) {
            ar.push(
                `this.on("${ev}", e => {
    //console.log('>> XO form Event: ${ev}", e.detail);
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
