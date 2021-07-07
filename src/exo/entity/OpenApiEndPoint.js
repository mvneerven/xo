class OpenApiEndPoint {
    constructor(method, path, options) {
        this.method = method;
        this.path = path;
        this.options = options
    }

    toString() {
        return `${this.method} ${this.path}`;
    }
}

export default OpenApiEndPoint;