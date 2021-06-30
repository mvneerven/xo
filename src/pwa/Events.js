

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
            console.debug(this.host.constructor.name, "listening to event", { name: eventName, f: func });
            host.addEventListener(eventName, func);
            return host;
        }
    }

    trigger(event, detail, ev) {
        console.debug(this.host.constructor.name, "triggering event", event, "detail: ", detail)

        if( typeof(event) === "object" && event instanceof Event ){
            return this.host.dispatchEvent(event);    
        }

        if (!ev) {
            ev = new Event(event, { bubbles: false, cancelable: true });
        }

        ev.detail = {            
            ...(detail || {}),
            host: this.host
        };

        return this.host.dispatchEvent(ev);
    }

}

export default Events;