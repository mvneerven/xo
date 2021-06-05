import ExoElementControl from '../base/ExoElementControl';
import DOM from '../../../pwa/DOM';
import Core from '../../../pwa/Core';

class ExoLeafletMapControl extends ExoElementControl {

    static _staticConstructor = (function () {
        DOM.addStyleSheet("https://unpkg.com/leaflet@1.7.1/dist/leaflet.css");
        DOM.require("https://unpkg.com/leaflet@1.7.1/dist/leaflet.js", e => {
            ExoLeafletMapControl.ready = true
        });
    })();

    constructor() {
        super(...arguments);

        this._zoom = 10;
        this.width = 640;
        this.height = 480;

        this.acceptProperties(
            {
                name: "value",
                type: Array

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
            }

        );
    }

    async render() {
        await super.render();

        let elm = document.createElement("div");
        if(this.width)
            elm.style.width = typeof(this.width) === "number" ? this.width + "px" : this.width;

        if(this.height)
            elm.style.height = typeof(this.height) === "number" ? this.height + "px" : this.height;

        this.map = await ExoLeafletMapControl.create(elm, this.value, this.zoom, this.options)

        this.container.appendChild(elm)

        return this.container;
    }

    get value() {
        return this._value;
    }

    set value(pos) {
        if(typeof(pos) === "string")
            this._value = pos.split(",");
        else if(Array.isArray(pos))
            this._value = pos;
        else
            throw Error("Invalid coordinates for map")
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
        let p = [pos[0], pos[1]];
        

        var map = L.map(elm).setView(p, zoom);

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.marker(p).addTo(map)

        map._onResize(); 

        // if(options.markers){
        //     options.markers.forEach(e => {
        //         L.marker(p).addTo(map)
        //             .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
        //             .openPopup();
        //     })
        // }

        ready(map)
    }

}

export default ExoLeafletMapControl;