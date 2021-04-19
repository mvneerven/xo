import DOM from './DOM';

class PWA_Area {
    constructor(name, element) {
        this.name = name;
        const _ = this;

        _.element = element;

        _.checkPinnable()
    }

    add(e) {
        if (!e)
            return;

        try {
            if (typeof (e) == "string") {
                if (e.indexOf('<') === -1)
                    e = DOM.parseHTML('<span>' + e + '</span>');
                else
                    e = DOM.parseHTML(e)
            }

            this.element.appendChild(e)

        }
        catch (ex) {
            throw "Area.add failed for " + e + ". " + ex.toString();
        }

    }

    set(s) {
        this.element.innerHTML = s;
    }

    clear() {
        this.set("");
    }

    checkPinnable() {
        const _ = this;
        if (_.element.classList.contains("pwa-pinnable")) {
            // check hover over pin icon (cannot be done using CSS, since it's a pseudo-element - :before )
            _.element.addEventListener("mouseover", e => {
                let overPin = (e.offsetX > _.element.offsetWidth - 70) && (e.offsetY < 70);
                if (overPin) {
                    _.pinActive = true;
                    _.element.classList.add("pin-active");
                }
                else if (_.pinActive) {
                    _.pinActive = false;
                    _.element.classList.remove("pin-active");
                }
            });

            _.element.addEventListener("click", e => {
                if (_.pinActive) {
                    _.pinned = !_.pinned
                }
            });
        }
    }

    get pinned() {
        return this.element.classList.contains("pinned")
    }

    set pinned(value) {
        this.element.classList[value ? "add" : "remove"]("pinned");
        if (!value) {
            this.element.classList.remove("pin-active");
        }
    }

    // bosy state
    set busy(value) {
        if (value) {
            this.element.classList.add("pwa-loading")
        }
        else {
            this.element.classList.remove("pwa-loading")
        }
    }

    get busy() {
        this.element.classList.add("pwa-loading")
    }

    // empty state
    set empty(value) {
        clearTimeout(this.rtimer);
        clearTimeout(this.atimer);
        if (value) {
            this.element.classList.remove("remove");

            this.rtimer = setTimeout(() => {
                this.element.classList.remove("add");
            }, 100);

            this.element.classList.add("pwa-empty-state", "add");
        }
        else {
            this.element.classList.add("remove");
            this.rtimer = setTimeout(() => {
                this.element.classList.remove("pwa-empty-state", "remove");
            }, 500);
        }
    }

    get empty() {
        return this.element.classList.includes("pwa-empty-state");
    }
}

export default PWA_Area;