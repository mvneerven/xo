class GridColumnResizer {
    constructor(elm) {
        this.wrapper = elm;
        this.grid = elm.getAttribute("data-resize-grid");

        this.setStyle = () => {
            this.wrapper.style =
                "display: grid; grid-gap: 5px; cursor: col-resize; grid-template-columns: " + this.grid;

        }

        const test = e => {
            if (window.innerWidth <= 992) {
                this.wrapper.removeAttribute("style")
            }
            else {
                this.setStyle();
            }
        };

        window.addEventListener("resize", test)
        test();

        this.wrapper.querySelectorAll(":scope > *").forEach(c => {
            c.style = "cursor: default";
        });

        this.onResize = this.resizeHandler.bind(this);
        this.onStop = this.stopResize.bind(this);
        this.wrapper.addEventListener("mousedown", this.initResize.bind(this));
    }

    initResize(event) {
        if (event.target !== this.wrapper)
            return;

        this.init(event);

        this.stopResize(event, true);
        this.wrapper.addEventListener("mousemove", this.onResize);
        this.wrapper.addEventListener("mouseup", this.onStop);
    }

    init(event) {
        this.columns = [];
        let columnDefs = this.grid.split(" ");

        let ix = 0;
        this.wrapper.querySelectorAll(":scope > *").forEach(c => {
            this.columns.push({
                element: c,
                origWidth: c.offsetWidth,
                spec: columnDefs[ix],
                isFree: columnDefs[ix].indexOf("fr") !== -1
            });
            ix++;
        });

        this.offsetX = event.clientX - this.wrapper.offsetLeft;
        this.startX = this.offsetX;
        this.index = -1;
        let distance = 10000;
        let i = 0;
        let x = 0;
        this.columns.forEach((c) => {
            x += c.origWidth;
            let xo = Math.abs(this.offsetX - x);
            if (xo < distance) {
                distance = xo;
                this.index = i + (c.isFree ? 1 : 0);
            }
            i++;
        });
    }

    resizeHandler(event) {
        event.preventDefault();
        this.offsetX = event.clientX - this.wrapper.offsetLeft;

        let diff = this.offsetX - this.startX;

        if (this.index === this.columns.length - 1) {
            diff = -diff;
        }

        this.columns[this.index].width = this.columns[this.index].origWidth + diff;

        let tc = this.columns
            .map((c) => {
                return c.isFree ? c.spec : (c.width || c.origWidth) + "px";
            })
            .join(" ");

        this.wrapper.style.gridTemplateColumns = tc; //this.offsetX + "px 1fr 200px";
    }

    stopResize(event, nocb) {
        this.wrapper.removeEventListener("mousemove", this.onResize);
        this.wrapper.removeEventListener("mouseup", this.onStop);
    }
}



export default GridColumnResizer;