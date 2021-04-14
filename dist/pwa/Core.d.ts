export default Core;
declare class Core {
    static operatorTable: {
        '>': (a: any, b: any) => boolean;
        '<': (a: any, b: any) => boolean;
        '<=': (a: any, b: any) => boolean;
        '===': (a: any, b: any) => boolean;
        '!==': (a: any, b: any) => boolean;
        '==': (a: any, b: any) => boolean;
        '!=': (a: any, b: any) => boolean;
        '&': (a: any, b: any) => number;
        '^': (a: any, b: any) => number;
        '&&': (a: any, b: any) => any;
    };
    static Iterator: typeof Iterator;
    static addEvents(obj: any): void;
    static compare(operator: any, a: any, b: any): any;
    static stringifyJSONWithCircularRefs(json: any): string;
    static toPascalCase(s: any): any;
    static prettyPrintJSON(obj: any): string;
    static guid(): string;
    static waitFor(f: any, timeoutMs: any): Promise<any>;
    static isValidUrl(urlString: any): boolean;
}
declare class Iterator {
    constructor(o: any, key: any);
    index: {
        key: string;
        order: any;
    }[];
    i: number;
    o: any;
    len: number;
    next(): any;
}
