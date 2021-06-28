import DOM from './DOM';
import Core from './Core';

const reactiveData = {
    isConnected: false,
};

class PWA_EventHub {
    constructor(app) {
        this.app = app;
        this.settings = {
            ...this.app.config.signalR || {}
        };
        this.settings.oncloseReopenTimeout = this.settings.oncloseReopenTimeout || 20000;
        this.events = new Core.Events(this);
    }

    async init() {
        return new Promise((resolve, reject) => {
            if (this.settings && this.settings.enabled) {
                
                console.debug("PWA_EventHub", "Opening signalR connection ", this.settings.notificationServiceUrl);

                DOM.require("https://cdn.jsdelivr.net/npm/@aspnet/signalr@1.1.2/dist/browser/signalr.js", () => {
                    this.open().then(resolve);
                })
            }
            else {
                resolve()
            }
        })
    }

    waitAndtryToReopenSignalRConnection() {
        console.info("signalR", `Waiting ${this.settings.oncloseReopenTimeout / 1000} seconds before trying to reconnect....`)
        setTimeout(() => {
            console.info("signalR", "Reopening....")
            this.open()
        }, this.settings.oncloseReopenTimeout);
    }

    async open() {
        try {
            console.debug('signalR', 'Starting SignalR connection negotiation');

            this.signalRConnection = new signalR.HubConnectionBuilder()
                .withUrl(this.settings.notificationServiceUrl + "/api")
                .configureLogging(signalR.LogLevel[this.settings.logLevel]) //don't use in production
                .build();

            this.signalRConnection.on('newMessage', msg => {
                console.debug("signalR", msg);

                this.events.trigger(msg.notificationDTO.useCase, {
                    ...msg.notificationDTO
                })
            });

            this.signalRConnection.onclose(() => {
                console.warn("signalR", 'disconnected')
                this.waitAndtryToReopenSignalRConnection();
            });

            await this.signalRConnection.start()
            reactiveData.isConnected = true

            console.debug('signalR', 'connected');

            let signalRConnectionId = await this.signalRConnection.invoke("GetConnectionId");
            console.info(`SignalR connectionId = ${signalRConnectionId}`);

            this.events.trigger("connected", {
                connectionId: signalRConnectionId
            })
        }
        catch (ex) {
            console.error("SignalR", "Error while opening connection: ", ex.toString());
            this.waitAndtryToReopenSignalRConnection();
        }
    }
}

export default PWA_EventHub;