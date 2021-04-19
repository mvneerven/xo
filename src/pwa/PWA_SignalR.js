import DOM from './DOM';

class PWA_SignalR {
    constructor(app) {
        this.app = app;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const sr = this.app.config.signalR;

            const reactiveData = {      
                isConnected: false                
              };
            
            if(sr && sr.enabled){
                DOM.require("https://cdn.jsdelivr.net/npm/@aspnet/signalr@1.1.2/dist/browser/signalr.js", () => {

                    const signalRConnection = new signalR.HubConnectionBuilder()
                        .withUrl(sr.notificationServiceUrl + "/api")
                        .configureLogging(signalR.LogLevel[sr.logLevel]) //don't use in production
                        .build();

                    signalRConnection.on('newMessage', msg => {
                        this.app.triggerEvent("eventhub.topic." + msg.notificationDTO.useCase, {
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
            else{
                resolve()
            }
        })
    }
}

export default PWA_SignalR;