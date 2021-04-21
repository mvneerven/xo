export default PWA_UI;
declare class PWA_UI {
    constructor(pwa: any);
    _dirtyMessage: string;
    _dirty: boolean;
    areas: {};
    notifications: PWA_Notifications;
    pwa: any;
    html: HTMLHtmlElement;
    set theme(arg: any);
    get theme(): any;
    set dirty(arg: boolean);
    get dirty(): boolean;
    _setAreas(): void;
    _theme: any;
    addStyleSheet(url: any): void;
    showDialog(options: any): Promise<void>;
}
import PWA_Notifications from "./PWA_Notifications";
