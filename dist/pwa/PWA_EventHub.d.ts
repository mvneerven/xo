export default PWA_EventHub;
declare class PWA_EventHub {
    constructor(app: any);
    app: any;
    init(): Promise<any>;
    on(eventName: any, func: any): PWA_EventHub;
    _triggerEvent(eventName: any, detail: any, ev: any): any;
}
