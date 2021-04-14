export default DOM;
declare class DOM {
    static DragDropSorter: typeof DragDropSorter;
    static _staticConstructor: void;
    static parseHTML(html: any): ChildNode;
    static getValue(ctl: any): any;
    static setValue(ctl: any, value: any): void;
    static elementPath(e: any): any;
    static elementToString(el: any): string;
    static _checkNull(fName: any, c: any): void;
    static hide(ctl: any): void;
    static show(ctl: any): void;
    static enable(ctl: any): void;
    static disable(ctl: any): void;
    static trigger(el: any, type: any, x: any): void;
    static throttleResize(elm: any, callback: any): void;
    static changeHash(anchor: any): void;
    static prettyPrintHTML(str: any): any;
    static formatHTMLNode(node: any, level: any): any;
    static setupGrid(): void;
    static parseCSS(css: any): CSSRuleList;
    static waitFor(selector: any, limit: any): Promise<any>;
    static require(src: any, c: any): Promise<any>;
    static addStyleSheet(src: any, attr: any): void;
    static getObjectValue(obj: any, path: any, def: any): any;
    static format(template: any, data: any, settings: any): any;
    static stringToPath(path: any): any;
    static replace(oldElm: any, newElm: any): any;
    static unwrap(el: any): any;
    static copyToClipboard(elm: any): boolean;
    static maskInput(input: any, options: any): void;
}
declare class DragDropSorter {
    constructor(masterContainer: any, selector: any, childSelector: any);
    masterContainer: any;
    selector: any;
    childSelector: any;
    dragSortContainers: any;
    triggerEvent(eventName: any, detail: any): void;
    on(eventName: any, func: any): DragDropSorter;
    enableDragList(container: any, childSelector: any): void;
    enableDragItem(item: any): void;
    handleDrag(event: any): void;
    handleDrop(event: any): void;
    getOrder(): any[];
    destroy(): void;
}
