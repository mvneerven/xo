import ExoElementControl from '../base/ExoElementControl';
import DOM from '../../../pwa/DOM';
import Core from '../../../pwa/Core';

class ExoLeafletMapControl extends ExoElementControl {

    constructor() {

        super(...arguments);

        this.acceptProperties(
            {
                name: "coords",
                type: Array,
                demoValue: [52.85582619118, 5.717743972222222]

            },
            {
                name: "zoom",
                type: Number,
                default: 5
            },
            {
                name: "width",
                default: 640
            },
            {
                name: "height",
                default: 480
            },
            {
                name: "markers",
                type: Object
            }

        );
    }

    async render() {
        await super.render();
        DOM.addStyleSheet("https://unpkg.com/leaflet@1.7.1/dist/leaflet.css");
        return new Promise(resolve => {
            DOM.require("https://unpkg.com/leaflet@1.7.1/dist/leaflet.js", async e => {
                ExoLeafletMapControl.loaded = true

                let elm = document.createElement("div");
                if (this.width)
                    elm.style.width = typeof (this.width) === "number" ? this.width + "px" : this.width;

                if (this.height)
                    elm.style.height = typeof (this.height) === "number" ? this.height + "px" : this.height;

                this.map = await ExoLeafletMapControl.create(elm, this.coords || [0, 0], this.zoom, this)

                this.container.appendChild(elm)

                resolve(this.container);
            });
        })
    }

    set coords(pos) {
        let oldValue = this._pos;
        if (typeof (pos) === "string") {
            this._pos = pos.split(",");
            if (!Number.parseFloat(this._pos[0]))
                return;

        }
        else if (Array.isArray(pos))
            this._pos = pos;
        else
            throw Error("Invalid coordinates for map")

        if (this.rendered && this._pos !== oldValue) {
            this.refresh();
        }
    }

    get coords() {
        return this._pos || [0, 0];
    }

    set markers(value) {
        this._markers = value;

        if (this.rendered && this.map) {

            value.forEach(e => {
                let map = this.map;
                L.marker(e.position).addTo(map)
                    .bindPopup(e.text)
                    .openPopup();
            })
        }
    }

    get markers() {
        return this._markers || [];
    }

    set zoom(value) {
        this._zoom = value;
    }

    get zoom() {
        return this._zoom || 0;
    }

    static async create(elm, pos, zoom, options) {
        options = options || {};
        return new Promise((resolve, reject) => {
            Core.waitFor(() => {
                return ExoLeafletMapControl.loaded && window.L;
            }).then(() => {
                setTimeout(() => {
                    ExoLeafletMapControl.generate(elm, pos, zoom, options, resolve)
                }, 50);

            }, 2000)
        });
    }

    static generate(elm, pos, zoom, options, ready) {
        pos = Array.isArray(pos) && pos.length > 1 ? pos : [0, 0];

        let p = [pos[0], pos[1]];

        elm.data = elm.data || {};

        if (!L)
            throw Error("Could not load Leaflet");

        var map = L.map(elm).setView(p, zoom);

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.marker(p).addTo(map)

        map._onResize();

        elm.data.map = map;

        if (options.markers) {
            options.markers.forEach(e => {

                L.marker(e.position).addTo(map)
                    .bindPopup(e.text)
                    .openPopup();
            })
        }

        ready(map)
    }

    refresh() {
        if (this.map) {
            console.debug("ExoLeafletMapControl", "Update map" + this.coords, this.map);
            this.map.setView(this.coords || [0, 0], this.zoom);
        }

    }
}

export default ExoLeafletMapControl;