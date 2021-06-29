
class MsIdentity {

    options = {
        mode: "redirect",
        libUrl: "https://alcdn.msauth.net/browser/2.15.0/js/msal-browser.js",
        msal: {
            auth: {
                clientId: "<clientid>",
                authority: "<authority>",
                redirectUri: document.URL.split("#")[0],
            },
            cache: {
                //cacheLocation: "sessionStorage", // This configures where your cache will be stored
                cacheLocation: 'localStorage',
                storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
            },
            system: {
                loggerOptions: {
                    loggerCallback: (level, message, containsPii) => {
                        if (containsPii) {
                            return;
                        }
                        switch (level) {
                            case msal.LogLevel.Error:
                                console.error(message);
                                return;
                            case msal.LogLevel.Info:
                                console.info(message);
                                return;
                            case msal.LogLevel.Verbose:
                                console.debug(message);
                                return;
                            case msal.LogLevel.Warning:
                                console.warn(message);
                                return;
                        }
                    }
                }
            },
            loginRequest: {
                scopes: ["User.Read"]
            },

            tokenRequest: {
                scopes: ["User.Read"],
                forceRefresh: false // Set this to "true" to skip a cached token and go to the server to get a new token
            }
        }
    }

    constructor(options) {
        var _ = this;
        options = options || {};
        _.options = { ...this.options, ...options };
    }

    // Loads lib and initializes MSAL
    async load() {
        const _ = this;
        return await new Promise((resolve, reject) => {
            _.require(_.options.libUrl, e => {
                console.debug(_.options.libUrl, "loaded");
                _.init();
                resolve(this);
            });
        })
    }

    require(src, c) {
        var d = document;
        d.querySelectorAll("head")
        let e = d.createElement('script');
        e.src = src
        d.head.appendChild(e);
        e.onload = c;
    }

    static trigger(x) {
        let ev = new Event("msid");
        ev.detail = x;

        document.body.dispatchEvent(ev);
    }


    init() {
        this.myMSALObj = new msal.PublicClientApplication(this.options.msal);

        if (this.options.mode !== "popup") {
            this.myMSALObj.handleRedirectPromise()
                .then(r => { this.handleResponse(r) })
                .catch((error) => {
                    console.error(error);
                });
        }

        this.getAccount();

    }

    signIn(email) {

        const account = this.getAccount();
        if (!account) {

            if (this.options.mode === "popup") {
                return this.myMSALObj.loginPopup(this.options.msal.loginRequest)
                    .then(response => {
                        if (response !== null) {
                            this.account = response.account;
                            this.signedIn();
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }
            else {
                return this.myMSALObj.loginRedirect(this.options.msal.loginRequest);
            }
        }
    }

    signedIn() {
        var _ = this;
        MsIdentity.trigger({
            type: "signedIn",
            account: _.account,
            mode: _.options.mode
        });
    }

    signOut() {
        var _ = this;
        if (_.account) {
            _.myMSALObj.logout({
                account: _.myMSALObj.getAccountByUsername(_.account.username)
            }).then(() => {
                MsIdentity.trigger({
                    type: "signedOut",
                    account: _.account,
                    mode: _.options.mode
                });

            });
        }
    }

    getAccount() {
        var _ = this;
        const currentAccounts = _.myMSALObj.getAllAccounts();
        if (currentAccounts.length === 0) {
            return null;
        } else if (currentAccounts.length > 1) {
            throw TypeError("Multiple accounts detected.");

        } else if (currentAccounts.length === 1) {
            _.account = currentAccounts[0];
            _.signedIn();
        }
    }



    // https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
    getJWT(username) {
        const _ = this;
        const request = _.options.msal.tokenRequest;

        return _.waitForInit().then(() => {

            if (!username)
                throw TypeError("No user signed in");

            request.account = _.myMSALObj.getAccountByUsername(username);
            return _.myMSALObj.acquireTokenSilent(request)
                .then(response => {
                    if (!response.accessToken || response.accessToken === "") {
                        throw new msal.InteractionRequiredAuthError;
                    }
                })
                .catch(error => {
                    if (error instanceof msal.InteractionRequiredAuthError) {
                        return _.myMSALObj.acquireTokenPopup(request);
                    } else {
                        console.warn(error);
                    }
                });
        })
    }

    // TODO improve - loading MSAL is async, we have to wait until it is fully loaded
    waitForInit() {
        const _ = this;
        const delay = t => new Promise(resolve => setTimeout(resolve, t));
        if (!_.myMSALObj) {
            return delay(200)
        }
        return delay(1)
    }

    handleResponse(response) {
        var _ = this;

        if (response !== null) {
            _.account = response.account;

            if (!_.isBusy())
                _.signedIn();
        }
    }

    isBusy() {
        return this.myMSALObj.interactionInProgress();
    }

}

export default MsIdentity;