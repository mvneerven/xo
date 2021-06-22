const DOM = window.xo.dom;
const Core = window.xo.core;

class ExoFormLiveEditor {
    constructor(builder, container) {
        this.events = new Core.Events(this)
        this.container = container;
        var main = builder.app.UI.areas.main.element.querySelector('[data-name=exploreTabs]')
    }

    setupPropertyView() {
        const _ = this;
        _.container.addEventListener("mouseover", e => {
            let f = _.getFieldInfo(e);
            if (f) {
                e.target.title = window.xo.form.factory.fieldToString(f);
            }
        });

        _.container.addEventListener("click", e => {
            
            _.container.querySelectorAll(".exb-active").forEach(e=>{
                e.classList.remove("exb-active")    
            });
            e.target.classList.add("exb-active")

            let f = _.getFieldInfo(e);
            if (f) {
                e.target.classList.add("exb-active")
                _.events.trigger("field-props", { field: f })
            }
        })
    }

    getFieldInfo(e) {
        if (e.target.classList.contains("exf-ctl-cnt")) {
            return window.xo.form.factory.getFieldFromElement(e.target);
        }
    }

    set enabled(value) {
        this.container.classList[value ? "add" : "remove"]("exf-wysiwyg");

        if (value) {
            this.setupPropertyView();
            this.sorter = new DOM.DragDropSorter(this.container, 'form', '.exf-ctl-cnt', '.exf-page').on("sort", e => {
                console.debug("ExoFormLiveEditor", "Sorted in live editor", e.detail);
            });

            this.events.trigger("enable")
        }
        else {
            if (this.sorter) {
                this.sorter.destroy();
                this.sorter = null;
            }

            this.events.trigger("disable")
        }
    }

    get enabled() {
        return this.switchElement.querySelector("INPUT").value === "1";
    }
}

export default ExoFormLiveEditor;