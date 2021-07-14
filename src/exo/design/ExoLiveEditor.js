import ExoFormFactory from '../core/ExoFormFactory';
import DOM from '../../pwa/DOM';
import xo from '../../../js/xo';

class ExoLiveEditor {
    constructor(exo) {
        this.exo = exo;
        this.init()
    }

    async init() {
        const me = this;
        this.btn = await xo.form.run({
            type: "button",
            icon: "ti-menu",
            name: "dropper",
            dropdown: [
                {
                    caption: `Edit`,
                    icon: "ti-pencil",
                    tooltip: "Edit field",
                    click: async e => {
                        me.activeElement = e.target.closest(".exf-le-active");
                        me.activeControl = me.getControl(me.activeElement);

                        console.log(me.activeControl.jsonSchema);

                        DOM.showDialog({
                            title: me.activeControl.toString(),
                            body: await xo.form.run(this.generateFormSchemaForField(me.activeControl), {
                                on: {
                                    created: e => {
                                        me.fieldEditorForm = e.detail.host;
                                    }
                                }
                            }),
                            click: async (btn, e) => {
                                //let code = me.fieldEditorForm.get("code")._control;

                                if (btn === "confirm") {
                                    //me.activeControl.schema = code.value
                                }
                            }
                        });
                    }
                },
                {
                    caption: `Delete`,
                    icon: "ti-close",
                    tooltip: "Delete",
                    click: e => {
                        
                    }
                }
            ]
        });
        this.btn.classList.add("exf-le-ctx"),
            this.exo.form.addEventListener("mousemove", e => {
                let ctl = this.getControl(e.target);
                if (ctl) {
                    if (ctl.context.exo === this.exo)
                        this.currentElement = ctl.container || ctl.htmlElement;
                }
            })
        this.renderStyleSheet();
    }

    generateFormSchemaForField(control, raw) {
        if (raw) {
            return {
                model: {
                    instance: {
                        data: {
                            raw: control.schema
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
            navigation: "none",

        }

        return schema;
    }

    getControl(elm) {
        let field = ExoFormFactory.getFieldFromElement(elm, {
            master: true // lookup master if nested
        });

        if (field)
            return field._control;

    }

    renderStyleSheet() {
        const prevStyleSheet = document.getElementById(
            `exf-liveedit`
        );
        if (prevStyleSheet) prevStyleSheet.remove();

        const cssSheet = document.createElement("style");
        cssSheet.id = `exf-liveedit`;

        cssSheet.innerHTML = `@import url(https://cdn.jsdelivr.net/themify-icons/0.1.2/css/themify-icons.css);
        @import url(https://xo-js.dev/1.4/xo.css)
        `;

        document.querySelector("head").appendChild(cssSheet);
    }

    set currentElement(elm) {
        if (this._currentElement) {
            this._currentElement.classList.remove("exf-le-active")
        }
        this._currentElement = elm;
        this._currentElement.classList.add("exf-le-active")
        this._currentElement.appendChild(this.btn);
    }

    get currentElement() {
        return this._currentElement;
    }
}

export default ExoLiveEditor;