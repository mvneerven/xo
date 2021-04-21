export default MsIdentity;
declare class MsIdentity {
    static trigger(x: any): void;
    constructor(options: any);
    options: {
        mode: string;
        libUrl: string;
        msal: {
            auth: {
                clientId: string;
                authority: string;
                redirectUri: string;
            };
            cache: {
                cacheLocation: string;
                storeAuthStateInCookie: boolean;
            };
            system: {
                loggerOptions: {
                    loggerCallback: (level: any, message: any, containsPii: any) => void;
                };
            };
            loginRequest: {
                scopes: string[];
            };
            tokenRequest: {
                scopes: string[];
                forceRefresh: boolean;
            };
        };
    };
    load(): Promise<any>;
    require(src: any, c: any): void;
    init(): void;
    myMSALObj: any;
    signIn(email: any): void;
    signedIn(): void;
    signOut(): void;
    getAccount(): any;
    getJWT(username: any): Promise<any>;
    waitForInit(): Promise<any>;
    handleResponse(response: any): void;
    isBusy(): any;
}
