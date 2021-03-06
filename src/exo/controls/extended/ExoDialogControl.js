
import ExoBaseControls from '../base';
import Core from '../../../pwa/Core';
import DOM from '../../../pwa/DOM';

const MODES = ["default", "side"];

class ExoDialogControl extends ExoBaseControls.controls.div.type {
    title = "Dialog";
    _visible = false;
    confirmText = "OK";
    cancelText = "Cancel";
    cancelVisible = true;

    _mode = "default";
    body = "The dialog body";
    modal = false;

    constructor() {
        super(...arguments);
        
        this.events = new xo.core.Events(this);

        this.acceptProperties("title", "cancelText", "body", "confirmText",
            {
                name: "cancelVisible",
                type: Boolean
            },
            {
                name: "modal",
                type: Boolean
            },
            {
                name: "click",
                type: Object
            },
            {
                name: "mode",
                type: String,
                description: "Set to 'default', 'side'"
            }

        );
        
    }

    mapAcceptedProperties(){
        super.mapAcceptedProperties();
        
        this.id = Core.guid({ compact: true, prefix: "dlg" });
        this.useContainer = false;
    }

    set visible(value) {
        this._visible = value;
        if (this.rendered) {
            if (value) {
                this.show()
            }
            else {
                this.hide();
            }
        }
    }

    handleInteraction(e, confirm) {
        var btn = "cancel", b = e.target;
        if (confirm || b.classList.contains("confirm")) {
            btn = "confirm";
        }

        let isClose = b && b.closest("button") && b.closest("button").classList.contains("dlg-x"); // standard dialog close button

        if (!this.modal || this.isDlgButton(b) || isClose) {
            if (!b.closest(".exf-dlg-b")) {
                this.hide.apply(this, [btn || (isClose ? "cancel" : undefined), e]);
            }
        }
    }

    getTemplate() {
        let bdy = typeof (this.body) === "string" ? this.body : "";
        return /*html*/`<div class="exf-dlg ${this.context.field.class || ""}" role="dialog" id="${this.dlgId}" style="display:none">
        <div class="exf-dlg-c">
            <div class="exf-dlg-h">
                <div class="exf-dlg-t">${this.title}<button type="button" class="dlg-bc dlg-x dismiss" ><span>&times;</span></button></div>
            </div>
        <div class="exf-dlg-b">${bdy}</div>
        <div class="exf-dlg-f">
            <button type="button" class="dlg-x btn exf-btn btn-primary confirm" >${this.confirmText}</button>
            <button type="button" class="dlg-x btn exf-btn btn-default dismiss" >${this.cancelText}</button>
        </div>
        </div>
        </div>`;
    }

    async generateDialog() {
        let body;
        if (typeof (this.body) === "object") { // body element passed
            if (this.body instanceof HTMLElement) {
                body = this.body;
            }
            else {
                body = await xo.form.run(this.body);
            }
        }
        else if (Core.isUrl(this.body)) {
            body = await xo.form.run(this.body);
            this.body = "";
        }
        this.dlg = DOM.parseHTML(this.getTemplate());

        if (body)
            this.dialogBody.appendChild(body);

        if (!this.cancelVisible) {
            this.dlg.querySelector(".exf-dlg-f .dismiss")?.remove();
        }
        document.body.appendChild(this.dlg);
        return this.dlg;
    }

    get dlgId() {
        return this._dlgId;
    }

    get mode() {
        return this._mode;
    }

    set mode(value) {
        if (!MODES.includes(value))
            throw TypeError("Invalid dialog mode");
        this._mode = value;
    }

    show() {
        const me = this;
        this.generateDialog().then(x => {

            me.events.trigger("ready", {
                body: x
            });
            MODES.forEach(m => {
                this.dlg.classList.remove("exf-dlg-" + m)
            })

            this.dlg.classList.add("exf-dlg-" + this.mode);
            if (this.mode === "side") {
                this.dlg.classList.add("exf-dlg-sidepanel-animation");
            }

            this.dlg.style.display = "block";

            setTimeout(() => {
                this.dlg.classList.remove("exf-dlg-sidepanel-animation");

                document.body.addEventListener("keydown", e => {
                    if (e.keyCode === 27) this.handleInteraction(e);
                    if (e.keyCode === 13) this.handleInteraction(e, true);
                }, {
                    once: true
                });

                me.dlg.querySelector(".dlg-x").addEventListener("click", me.handleInteraction.bind(this));

                me.dlg.addEventListener("click", me.handleInteraction.bind(this));

                if (!me.modal) {
                    document.body.addEventListener("click", me.handleInteraction.bind(this), {
                        once: true
                    })
                }
            }, 100)
        });

    }

    hide(button, e) {
        this.value = button;

        var evt = new Event("change", { bubbles: true, cancelable: true })
        this.htmlElement.dispatchEvent(evt);

        if (typeof (this.click) === "function") {
            this.click(button, e)
        }

        this.remove()
    }

    isDlgButton(b) {
        return b.nodeName === "BUTTON" && b.closest(".exf-dlg-f");
    }

    get dialogBody() {
        if (this.dlg) {
            return this.dlg.querySelector(".exf-dlg-b")
        }
    }

    remove() {
        if (this.dlg) {
            this.dlg.remove();
        }
    }

    async render() {
        const me = this;
        await super.render();
        if (this.context.field.demo) {

            this.container.appendChild(await xo.form.run({
                type: "button",
                caption: "Open " + me.caption,
                tooltip: "This is an autogenerated helper button to open the dialog. See documentation for the use of dialogs in ExoForm.F",
                name: "btn_" + this.id,
                click: e => {
                    me.show();
                }
            }))


        }
        return this.container;
    }
}

export default ExoDialogControl;