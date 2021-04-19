import DOM from './DOM';
import Core from './Core';

class PWA_Notifications {
    constructor(ui) {
        this.UI = ui;
    }

    add(msg, options) {
        options = options || { type: "info" };

        if (!msg)
            msg = "An unknown error has occurred";
        else if (typeof (msg) !== "string")
            msg = msg.toString();

        const tpl = /*html*/`
            <div class="pwa-notif pwa-{{type}}">
                <div class="pwa-cnt">
                    <span>{{msg}}</span>
                    <div class="pwa-notif-btns"></div>
                    <progress value="100" max="100"></progress>
                </div>
            </div>
        `;

        let notif = DOM.parseHTML(
            DOM.format(tpl, {
                type: options.type,
                msg: msg
            })
        );

        if (options.buttons) {
            let notifBtn = notif.querySelector(".pwa-notif-btns");
            for (var b in options.buttons) {
                let btn = options.buttons[b]

                let btnHtml = DOM.parseHTML(DOM.format(`<button class="btn">{{caption}}</button>`, btn));
                notifBtn.appendChild(btnHtml)
                btnHtml.addEventListener("click", e => {
                    e.stopPropagation();
                    btn.click(e)
                });

            }
        }

        notif.addEventListener("click", () => {
            notif.remove();
        })

        const timeout = options.timeout || (2000 + (msg.split(' ').length * 200));

        document.body.appendChild(notif);

        let prog = notif.querySelector("progress");
        prog.setAttribute("value", "100");

        var i = 100, countDown;
        countDown = setInterval(() => {
            i--
            prog.setAttribute("value", i.toString());
            if (i <= 0)
                clearInterval(countDown);

        }, timeout / 100);


        setTimeout(() => {
            notif.classList.add("move-out");

            setTimeout(() => {
                notif.remove();
            }, 2000);

        }, timeout);
    }
}

export default PWA_Notifications;