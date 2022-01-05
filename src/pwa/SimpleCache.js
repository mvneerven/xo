import Core from './Core';

const TYPES = {
    MEMORY: "memory",
    STORAGE: "localStorage"
}

class SimpleCache {
    constructor(dataAccessor, durationMs, type) {
        this.id = Core.guid({ compact: true, prefix: "sci" })
        this.dataAccessor = dataAccessor;
        this.duration = durationMs;
        this.type = type || TYPES.MEMORY;
    }

    async get() {
        console.debug("cache: timediff=", this.timeDiffMs());

        if (this.timeDiffMs() < this.duration) {
            console.debug("cache:", "Taking cache....");
            return this.value;
        }

        console.debug("cache:", "Update cache....");
        this.lastFetchDate = new Date();
        this.value = await this.dataAccessor();
        return this.value;
    }

    get value() {
        switch (this.type) {
            case TYPES.MEMORY:
                return this.cache;
            case TYPES.STORAGE:
                return JSON.parse(localStorage.getItem(this.id));
        }
    }

    set value(data) {
        switch (this.type) {
            case TYPES.MEMORY:
                this.cache = data;
                break;
            case TYPES.STORAGE:
                localStorage.setItem(this.id, JSON.stringify(data));
                break;
        }
    }

    delete() {
        switch (this.type) {
            case TYPES.MEMORY:
                delete this.cache;
                break;
            case TYPES.STORAGE:
                localStorage.removeItem(this.id);
                break
        }
    }

    timeDiffMs() {
        return new Date() - this.lastFetchDate;
    }
}

export default SimpleCache;
