import DOM from './DOM';
import Core from './Core';

class PWA_EventHub {
    constructor(app) {
        this.app = app;
        Core.addEvents(this); // add simple event system
    }

    async init() {
        return new Promise((resolve, reject) => {
            const sr = this.app.config.signalR;

            const reactiveData = {
                isConnected: false
            };

            if (sr && sr.enabled) {
                DOM.require("https://cdn.jsdelivr.net/npm/@aspnet/signalr@1.1.2/dist/browser/signalr.js", () => {

                    const signalRConnection = new signalR.HubConnectionBuilder()
                        .withUrl(sr.notificationServiceUrl + "/api")
                        .configureLogging(signalR.LogLevel[sr.logLevel]) //don't use in production
                        .build();

                    signalRConnection.on('newMessage', msg => {
                        console.debug("signalR", msg);

                        this._triggerEvent(msg.notificationDTO.useCase, {
                            ...msg.notificationDTO
                        })
                    });

                    signalRConnection.onclose(() => console.log('disconnected'));

                    console.log("Starting signalR connection ", sr.notificationServiceUrl);

                    signalRConnection.start()
                        .then(() => reactiveData.isConnected = true)
                        .catch(console.error);

                    resolve()
                })
            }
            else {
                resolve()
            }
        })
    }

    on(eventName, func) {
        console.debug("PWA_EventHub: listening to event", {name: eventName, f: func});
        this.addEventListener(eventName, func);
        return this;
    }

    _triggerEvent(eventName, detail, ev) {
        console.debug("PWA_EventHub: triggering event", eventName, "detail: ", detail)
        if (!ev) {
            ev = new Event(eventName, { bubbles: false, cancelable: true });
        }

        ev.detail = {
            eventHub: this,
            ...(detail || {})
        };

        return this.dispatchEvent(ev);
    }
}

export default PWA_EventHub;