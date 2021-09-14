import ExoFormFactory from '../core/ExoFormFactory';
import ExoForm from '../core/ExoForm';
import DOM from '../../pwa/DOM';
import Core from '../../pwa/Core';
import xo from '../../../js/xo';

class ExoLiveEditor {
    constructor(exo) {
        if (!(exo instanceof ExoForm))
            throw TypeError("No ExoForm passed")
        this.events = new Core.Events(this);
        this.exo = exo;
        this.init()
    }

    async init() {
        const me = this;
        this.exo.form.addEventListener("click", this.click.bind(this))

        this.renderStyleSheet();

        this.btnToggle = await xo.form.run({
            type: "button",
            caption: "LIVE",
            dropdown: [
                {
                    caption: `Toggle Live Edit`,
                    icon: "ti-pencil",
                    click: async e => {
                        me.enabled = !me.enabled;
                        me.btnToggle.classList[me.enabled ? "add" : "remove"]("active");

                        me.renderActiveState()
                    }
                },
            ]
        });

        this.btnToggle.classList.add("exf-le-btn");
        this.btnToggle.classList.remove("exf-btn");
        this.btnToggle.querySelector("button").classList.remove("exf-btn");

        this.exo.container.insertBefore(this.btnToggle, this.exo.form);
        this.btnToggle.setAttribute("title", await this.getFormMeta())
        console.debug("ExoLiveEditor: attached live editor to form ", this.exo.id)
    }

    renderActiveState() {
        if (this.enabled) {
            this.exo.query().forEach(f => {
                const ctl = f._control;
                this.addLiveEditToControl(ctl)
            });

            this.sorter = new DOM.DragDropSorter(
                this.exo.form.querySelectorAll(".exf-page"),
                this.exo.form.querySelectorAll(".exf-le-cnt")
            ).on("sorted", e => {
                let node = e.detail.element;
                let ctl = this.getControl(node.firstChild);
                let beforeCtl = null;
                let before = e.detail.before;
                if (before) beforeCtl = this.getControl(before.firstChild);
                const schema = this.exo.schema.insertBefore(ctl, beforeCtl);
                this.events.trigger("schema-change", {
                    schema: schema
                })
            })

        }
        else {
            this.exo.form.querySelectorAll(".exf-le-cnt").forEach(e => {
                let info = e.querySelector(".exf-le-fd");
                if (info) info.remove();
                DOM.unwrap(e);
            })

            if (this.sorter) {
                this.sorter.stop();
                this.sorter = null;
            }
        }
    }

    async addLiveEditToControl(ctl) {
        let cnt = ctl.container || ctl.htmlElement;

        let wrapper = DOM.wrap(cnt);
        wrapper.classList.add("exf-le-cnt")

        //let info = document.createElement("div");

        let info = await xo.form.run({
            type: "button",
            icon: "ti-menu",
            outerClass: "exf-le-fd",
            tooltip: ctl.toString(),
            dropdown: {
                direction: "left",
                items: [
                    {
                        caption: `Edit`,
                        icon: "ti-pencil",
                        tooltip: "Edit field",
                        click: async e => {
                            this.startEdit(e, false)
                        }
                    },
                    {
                        caption: `Edit (raw)`,
                        icon: "ti-settings",
                        tooltip: "Edit field schema",
                        click: async e => {
                            this.startEdit(e, true)
                        }
                    },
                    {
                        caption: `Remove`,
                        icon: "ti-close",
                        tooltip: "Remove the field",
                        click: e => {
                            this.delete(e)
                        }
                    }
                ]
            }
        })


        //info.classList.add("exf-le-fd");


        //info.innerHTML = ctl;
        wrapper.appendChild(info);
    }

    async getFormMeta() {
        return this.exo.toString()
    }

    click(e) {
        if (e.target.classList.contains("exf-le-fd")) {
            this.startEdit(e)
        }
    }
    
    isLiveEditButton(elm) {
        return elm.closest(".exf-le-ctx")
    }

    delete(e) {
        const me = this;

        let cnt = e.target.closest(".exf-le-cnt");
        me.activeElement = cnt.firstChild;
        me.activeControl = me.getControl(me.activeElement);

        const schema = this.exo.schema.delete(this.activeControl);
        this.events.trigger("schema-change", {
            schema: schema
        });

        cnt.remove();
    }

    async startEdit(e, raw) {
        const me = this;
        let cnt = e.target.closest(".exf-le-cnt")
        me.activeElement = cnt.firstChild;
        me.activeControl = me.getControl(me.activeElement);

        let dlg = await DOM.showDialog({
            class: "exf-le-dlg",
            title: me.activeControl.toString(),
            body: await xo.form.run(this.generateFormSchemaForField(me.activeControl, raw), {
                on: {
                    created: e => {
                        me.fieldEditorForm = e.detail.host;
                    }
                }
            }),
            click: async (btn, e) => {
                if (btn === "confirm") {
                    if (raw) {
                        let code = me.fieldEditorForm.get("code")._control;
                        me.activeControl = await me.activeControl.updateSchema(code.value)
                    }
                    else {
                        let m = me.fieldEditorForm.dataBinding.model;
                        me.activeControl = await me.activeControl.updateSchema(JSON.stringify(m.instance.data)) // update control in place
                    }

                    //me.addLiveEditToControl(me.activeControl) 

                    this.updateFormSchema();
                }
            }
        });

        dlg.container.classList.add("exf-le-dlg")
    }

    updateFormSchema() {
        const schema = this.exo.schema.update(this.activeControl);
        this.events.trigger("schema-change", {
            schema: schema
        })
    }

    generateFormSchemaForField(control, raw) {
        if (raw) {
            return {
                navigation: "none",
                model: {
                    instance: {
                        data: {
                            raw: JSON.stringify(control.schema, null, 2)
                        }
                    }
                },
                pages: [
                    {
                        fields: [
                            {
                                type: "aceeditor",
                                name: "code",
                                mode: "json",
                                caption: "Field",
                                bind: "instance.data.raw"
                            }
                        ]
                    }
                ]
            }
        }

        const schema = {
            navigation: "tabstrip",
            model: {
                schemas: {
                    data: control.jsonSchema
                },
                instance: {
                    data: {
                        ...control.schema
                    }
                }
            },
            mappings: {
                ...control.propertyUIMappings
            }
        }

        return schema;
    }

    getControl(elm) {
        let field = ExoFormFactory.getFieldFromElement(elm, {
            master: true // lookup master if nested
        });

        if (field) {
            let ctl = field._control;
            if (ctl) {
                if (ctl.context.exo !== this.exo) {
                    return;
                }
            }
            return ctl;
        }
    }

    set enabled(value) {
        this._enabled = value != false

        this.exo.form.classList[value ? "add" : "remove"]("exf-le-cnt");

        if (!this._enabled) {
            this.exo.form.querySelectorAll(".exf-le-active").forEach(e => {
                e.classList.remove("exf-le-active")
            })
            //this.btnField.style.display = "none"
        }
    }

    get enabled() {
        return this._enabled
    }

    renderStyleSheet(remove) {
        const prevStyleSheet = document.getElementById(
            `exf-liveedit`
        );
        if (prevStyleSheet) prevStyleSheet.remove();
        if (!remove) {
            const cssSheet = document.createElement("style");
            cssSheet.id = `exf-liveedit`;

            cssSheet.innerHTML = `@import url(https://cdn.jsdelivr.net/themify-icons/0.1.2/css/themify-icons.css);
           
        `;

            //  @import url(https://xo-js.dev/1.4/xo.css)

            document.querySelector("head").appendChild(cssSheet);
        }
    }

    set currentElement(elm) {
        if (this._currentElement) {
            if (this._currentElement === elm)
                return;

            this._currentElement.classList.remove("exf-le-active")
        }

        this._currentElement = elm;
        if (elm) {
            this._currentElement.classList.add("exf-le-active")
            //this._currentElement.appendChild(this.btnField);
        }
        //else {
        //this.btnField.style.display = "none";
        //}
    }

    get currentElement() {
        return this._currentElement;
    }
}

export default ExoLiveEditor;