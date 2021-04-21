export default PWA_Area;
declare class PWA_Area {
    constructor(name: any, element: any);
    name: any;
    element: any;
    add(e: any): void;
    set(s: any): void;
    clear(): void;
    checkPinnable(): void;
    set pinned(arg: any);
    get pinned(): any;
    set busy(arg: void);
    get busy(): void;
    set empty(arg: any);
    get empty(): any;
    rtimer: NodeJS.Timeout;
}
