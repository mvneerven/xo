
import ExoBaseControls from '../base/ExoBaseControls';
import Core from '../../../pwa/Core';
import DOM from '../../../pwa/DOM';

class ExoDialogControl extends ExoBaseControls.controls.div.type {

    title = "Dialog";

    _visible = false;

    confirmText = "OK";

    cancelText = "Cancel";

    cancelVisible = false;

    body = "The dialog body";

    modal = false;

    dlgTemplate = /*html*/`<div class="exf-dlg" role="dialog" id="{{dlgId}}">
<div class="exf-dlg-c">
    <div class="exf-dlg-h">
        <div class="exf-dlg-t">{{title}}<button type="button" class="dlg-bc dlg-x dismiss" ><span>&times;</span></button></div>
    </div>
<div class="exf-dlg-b">{{body}}</div>
<div class="exf-dlg-f">
    <button type="button" class="dlg-x btn exf-btn btn-primary confirm" >{{confirmText}}</button>
    <button type="button" class="dlg-x btn exf-btn btn-default dismiss" >{{cancelText}}</button>
</div>
</div>
</div>`;

    constructor(context) {
        super(context);
        this.acceptProperties("title", "cancelText", "body", "confirmText", "cancelVisible", "modal");
        this.dlgId = 'dlg_' + Core.guid().replace('-', '');
    }

    hide(button, e) {
        if (this.context.field.click) {
            this.context.field.click.apply(this, [button, e])
        }
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

    show() {
        const _ = this;

        let body;
        if (typeof (this.body) === "object") {
            body = this.body
            this.body = ""
        }

        let html = DOM.format(_.dlgTemplate, { ...this })

        this.dlg = DOM.parseHTML(html);

        if (body) {
            this.dialogBody.appendChild(body);
        }

        this.dlg.classList.add(this.cancelVisible ? "dlg-cv" : "dlg-ch");

        const c = (e, confirm) => {
            //window.location.hash = "na";
            var btn = "cancel", b = e.target;
            if (confirm || b.classList.contains("confirm")) {
                btn = "confirm";
            }

            if (!this.modal || this.isDlgButton(b)) {
                if (!b.closest(".exf-dlg-b")) {
                    _.hide.apply(_, [btn, e]);
                    if (!e.cancelBubble) {
                        _.remove();
                    }
                }
            }
        };

        this.dlg.querySelector(".dlg-x").addEventListener("click", c);

        document.body.appendChild(this.dlg);

        this.dlg.addEventListener("click", c);

        document.body.addEventListener("keydown", e => {
            if (e.keyCode === 27) c(e);
            if (e.keyCode === 13) c(e, true);
        }, {
            once: true
        });

        if (!this.modal)
            setTimeout(() => {
                document.body.addEventListener("click", c, {
                    once: true
                })
            }, 10)
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
        //let dlg = document.querySelector("#" + this.dlgId);
        if (this.dlg)
            this.dlg.remove();
    }
}

export default ExoDialogControl;