import Core from './Core';

class SimpleCache {
    constructor(dataAccessor, durationMs, type) {
        this.id = 'xo_sc_' + Core.guid().split('-').pop()
        this.dataAccessor = dataAccessor;
        this.duration = durationMs;
        this.type = type || "memory";
    }

    async get() {
        console.log("cache: timediff=", this.timeDiffMs());

        if (this.timeDiffMs() < this.duration) {
            console.log("cache:", "Taking cache....");
            return this.value;
        }

        console.log("cache:", "Update cache....");
        this.lastFetchDate = new Date();
        this.value = await this.dataAccessor();
        return this.value;
    }

    get value() {
        switch (this.type) {
            case "memory":
                return this.cache;
            case "localStorage":
                return JSON.parse(localStorage.getItem(this.id));
        }
    }

    set value(data) {
        switch (this.type) {
            case "memory":
                this.cache = data;
            case "localStorage":
                localStorage.setItem(this.id, JSON.stringify(data));
        }
    }

    delete() {
        switch (this.type) {
            case "memory":
                delete this.cache;
                break;
            case "localStorage":
                localStorage.removeItem(this.id);
                break
        }
    }

    timeDiffMs() {
        return new Date() - this.lastFetchDate;
    }
}

export default SimpleCache;
