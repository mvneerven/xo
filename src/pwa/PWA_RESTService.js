
class PWA_RESTService {

    constructor(app) {
        this.app = app;
    }

    send(endpoint, options) {
        const _ = this;

        const headers = new Headers();
        options = options || {};

        endpoint = new URL(endpoint, this.app.config.baseUrl);

        const fetchOptions = {
            method: "GET",
            ...options
        };

        let tokenAcquirer = (scope) => {
            return Promise.resolve();
        }
        if (!options.isAnonymous) {
            tokenAcquirer = () => {
                return _.app.getToken.apply(_.app)
            };
        }

        return tokenAcquirer().then(r => {
            if (r && r.accessToken) {
                headers.append("Authorization", `Bearer ` + r.accessToken);
            }
            else {
                console.warn("No JWT Token provided. Continuing anonymously");
            }

            if (options.headers) {
                for (var h in options.headers) {
                    headers.append(h, options.headers[h]);
                }
            }

            fetchOptions.headers = headers;

            if(fetchOptions.method === "DELETE"){
                return fetch(endpoint, fetchOptions);
            }
            return fetch(endpoint, fetchOptions).then(x=>{

                if(x.status === 200){
                    return x.json()
                }

                
                throw `HTTP Status ${x.status} - ${x.statusText} (${endpoint})`;

            })
            
        })
    }

    get(endpoint, options) {
        options = {
            ...options || {},
            method: "GET"
        }
        return this.send(endpoint, options)
    }

    post(endpoint, options) {
        options = {
            ...options || {},
            method: "POST"
        }
        return this.send(endpoint, options)
    }

    put(endpoint, options) {
        options = {
            ...options || {},
            method: "PUT"
        }
        return this.send(endpoint, options)
    }

    delete(endpoint, options) {
        options = {
            ...options || {},
            method: "DELETE"
        }
        return this.send(endpoint, options)
    }
}

export default PWA_RESTService;