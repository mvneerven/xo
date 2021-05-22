

// Simple Vanilla JS Event System
class Emitter {
    constructor(obj) {
        this.obj = obj;
        this.eventTarget = document.createDocumentFragment();
        ["addEventListener", "dispatchEvent", "removeEventListener"]
            .forEach(this.delegate, this);
    }

    delegate(method) {
        this.obj[method] = this.eventTarget[method].bind(this.eventTarget);
    }
}

class Events {
    constructor(host, options) {
        this.host = host;

        new Emitter(host); // add simple event system

        host.on = (eventName, func) => {
            console.debug(host.constructor.name, "listening to event", { name: eventName, f: func });
            host.addEventListener(eventName, func);
            return host;
        }
    }

    trigger(eventName, detail, ev) {
        console.debug(host.constructor.name, "triggering event", eventName, "detail: ", detail)
        if (!ev) {
            ev = new Event(eventName, { bubbles: false, cancelable: true });
        }

        ev.detail = {
            host: this.host,
            ...(detail || {})
        };

        return this.host.dispatchEvent(ev);
    }

}

export default Events;