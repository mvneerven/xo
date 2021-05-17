import Core from './Core';

class Events {
    constructor(host, options) {
        this.host = host;

        Core.addEvents(host); // add simple event system

        host.on = (eventName, func) => {
            console.debug(host.constructor.name, "listening to event", { name: eventName, f: func });
            host.addEventListener(eventName, func);
            return host;
        }
    }

    trigger(eventName, detail, ev) {
        console.debug("Shop: triggering event", eventName, "detail: ", detail)
        if (!ev) {
            ev = new Event(eventName, { bubbles: false, cancelable: true });
        }

        ev.detail = {
            shop: this,
            ...(detail || {})
        };

        return this.host.dispatchEvent(ev);
    }

}

export default Events;