import ExoBaseControls from './ExoBaseControls';
import DOM from '../pwa/DOM';


class ExoCircularChart extends ExoBaseControls.controls.div.type {  

    value = "0";
    size = "200";
    color = "#00acc1";

    constructor(context){
        super(context);

        this.acceptProperties(
            {name: "value", type: Number, description: "Percentual value of the chart (0-100)"},
            {name: "size"},
            {name: "color"}, 
            {name: "backgroundColor"}, 
            {name: "textColor"}, 
            {name: "subLineColor"},
            {name: "caption"
        })
    }

    async render() {
        const _ = this;
        
        const me = _.htmlElement;
        await super.render();

        const tpl = /*html*/`<svg class="circle-chart" viewbox="0 0 33.83098862 33.83098862" width="{{size}}" height="{{size}}" xmlns="http://www.w3.org/2000/svg">
            <circle class="circle-chart__background" stroke="{{backgroundColor}}" stroke-width="2" fill="none" cx="16.91549431" cy="16.91549431" r="15.91549431" />
            <circle class="circle-chart__circle" stroke="{{color}}" stroke-width="2" stroke-dasharray="{{value}},100" stroke-linecap="round" fill="none" cx="16.91549431" cy="16.91549431" r="15.91549431" />
            <g class="circle-chart__info">
              <text class="metric chart-pct" x="16.91549431" y="15.5" alignment-baseline="central" text-anchor="middle" font-size="8" >{{value}}%</text>
              <text class="metric chart-sub" x="16.91549431" y="20.5" alignment-baseline="central" text-anchor="middle" font-size="2" >{{caption}}</text>
            </g>
          </svg>`;

        me.appendChild(DOM.parseHTML(DOM.format(tpl, this)));

        this.container.classList.add("exf-std-lbl");
        return this.container;
    }
}

class ExoChartControls {
    static controls = {
        circularchart: { type: ExoCircularChart, note: "Simple circular chart (SVG)", demo: { mode: "html" } }

    }
}

export default ExoChartControls;