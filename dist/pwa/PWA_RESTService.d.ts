export default PWA_RESTService;
declare class PWA_RESTService {
    constructor(app: any);
    app: any;
    send(endpoint: any, options: any): Promise<any>;
    get(endpoint: any, options: any): Promise<any>;
    post(endpoint: any, options: any): Promise<any>;
    put(endpoint: any, options: any): Promise<any>;
    delete(endpoint: any, options: any): Promise<any>;
}
