import ExoElementControl from '../base/ExoElementControl';
import DOM from '../../../pwa/DOM';
import Core from '../../../pwa/Core';

class ExoLeafletMapControl extends ExoElementControl {
    constructor() {
        super(...arguments);

        this._zoom = 10;
        this.width = 640;
        this.height = 480;

        this.acceptProperties(
            {
                name: "value",
                type: Array,
                demoValue: [52.85582619118, 5.717743972222222]

            },
            {
                name: "zoom",
                type: Number
            },
            {
                name: "width"
            },
            {
                name: "height"
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
                ExoLeafletMapControl.ready = true

                let elm = document.createElement("div");
                if (this.width)
                    elm.style.width = typeof (this.width) === "number" ? this.width + "px" : this.width;

                if (this.height)
                    elm.style.height = typeof (this.height) === "number" ? this.height + "px" : this.height;

                this.map = await ExoLeafletMapControl.create(elm, this.value || [0, 0], this.zoom, this)

                this.container.appendChild(elm)

                resolve(this.container);
            });


        })


    }

    get value() {
        return this._value;
    }

    set value(pos) {
        let oldValue = this.value;
        if (typeof (pos) === "string")
            this._value = pos.split(",");
        else if (Array.isArray(pos))
            this._value = pos;
        else
            throw Error("Invalid coordinates for map")

        if (this.rendered && this._value !== oldValue) {
            this.refresh();
        }
    }

    set markers(value) {
        this._markers = value;

        if (this.rendered) {

            value.forEach(e => {
                let map = this.map;
                L.marker(e.position).addTo(map)
                    .bindPopup(e.text)
                    .openPopup();
            })
        }
    }

    get markers() {
        return this._markers;
    }

    set zoom(value) {
        this._zoom = value;
    }

    get zoom() {
        return this._zoom;
    }

    static async create(elm, pos, zoom, options) {
        options = options || {};
        return new Promise((resolve, reject) => {
            Core.waitFor(() => {
                return ExoLeafletMapControl.ready;
            }).then(() => {
                ExoLeafletMapControl.generate(elm, pos, zoom, options, resolve)
            }, 2000)
        });
    }

    static generate(elm, pos, zoom, options, ready) {

        pos = Array.isArray(pos) && pos.length > 1 ? pos : [0, 0];

        let p = [pos[0], pos[1]];

        elm.data = elm.data || {};

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
        console.debug("ExoLeafletMapControl", "Update map" + this.value, this.map);
        this.map.setView(this.value || [0, 0], this.zoom);

    }
}

export default ExoLeafletMapControl;