import ExoFormFactory from '../core/ExoFormFactory';
import DOM from '../../pwa/DOM';
import Core from '../../pwa/Core';
import xo from '../../../js/xo';

class ExoLiveEditor {
    constructor(exo) {
        this.events = new Core.Events(this);
        this.exo = exo;
        this.init()
    }

    async init() {
        const me = this;
        this.btnField = await xo.form.run({
            type: "button",
            icon: "ti-pencil",
            name: "dropper",
            dropdown: [
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
                    caption: `Delete`,
                    icon: "ti-close",
                    tooltip: "Delete",
                    click: e => {
                        this.delete(e)
                    }
                }
            ]
        });
        this.btnField.classList.add("exf-le-ctx");

        this.exo.form.addEventListener("mousemove", this.mouseMove.bind(this))

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
                    }
                },
            ]
        });
        this.btnToggle.classList.add("exf-le-btn");
        this.btnToggle.classList.remove("exf-btn");
        this.btnToggle.querySelector("button").classList.remove("exf-btn");

        this.exo.container.insertBefore(this.btnToggle, this.exo.form);
        console.log("Attached live editor to ", this.exo)
    }

    mouseMove(e) {

        if (!this.enabled)
            return;

        if (this.isLiveEditButton(e.target))
            return;

        let ctl = this.getControl(e.target);
        if (ctl) {

            if (ctl.context.exo === this.exo) {
                this.currentElement = ctl.container;
                this.btnField.style.display = "initial"
            }
        }
        else {
            this.currentElement = null
        }
    }

    isLiveEditButton(elm) {
        return elm.closest(".exf-le-ctx")
    }

    delete(e) {
        const me = this;

        me.activeElement = e.target.closest(".exf-le-active");
        me.activeControl = me.getControl(me.activeElement);

        const schema = this.exo.schema.delete(this.activeControl);
        this.events.trigger("schema-change", {
            schema: schema
        })
    }

    async startEdit(e, raw) {
        const me = this;

        me.activeElement = e.target.closest(".exf-le-active");
        me.activeControl = me.getControl(me.activeElement);

        console.log(me.activeControl.jsonSchema);

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
                        me.activeControl.schema = code.value
                    }
                    else {
                        let m = me.fieldEditorForm.dataBinding.model;
                        me.activeControl.schema = JSON.stringify(m.instance.data)
                    }
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
            console.log(ExoFormFactory.fieldToString(field))

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
            this.btnField.style.display = "none"
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
        @import url(https://xo-js.dev/1.4/xo.css)
        `;

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
            this._currentElement.appendChild(this.btnField);
        }
        else {
            this.btnField.style.display = "none";
        }
    }

    get currentElement() {
        return this._currentElement;
    }
}

export default ExoLiveEditor;