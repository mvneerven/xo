import ExoBaseControls from '../base';

class ExoSwitchControl extends ExoBaseControls.controls.range.type {

    static returnValueType = Boolean;

    setProperties() {
        this.context.field.min = 0;
        this.context.field.max = 1;
        this.context.field.value = this.context.field.value || 0;
        super.setProperties();

        this.context.field.type = "switch"
    }

    async render() {
        const _ = this;
        let e = await super.render();

        this.container.classList.add("exf-switch");
        // force outside label rendering
        this.container.classList.add("exf-std-lbl");

        const check = e => {

            let sw = e.target.closest(".exf-switch");
            let range = sw.querySelector("[type='range']");
            sw.classList[range.value === "1" ? "add" : "remove"]("on");
            _.triggerChange()
        };

        check({ target: e });

        e.addEventListener("click", e => {
            e.stopImmediatePropagation();
            e.cancelBubble = true;
            e.preventDefault();
            e.stopPropagation();
            e.returnValue = false;

            let range = e.target.closest(".exf-switch").querySelector("[type='range']");
            if (e.target.tagName != "INPUT") {

                range.value = range.value == "0" ? 1 : 0;
                check({ target: range });
            }
            check({ target: range });
        })

        return this.container;
        //return e;
    }

    get value(){
        return Boolean(this.htmlElement.value);
    }

    set value(data){
        this.htmlElement.value = data ? 1: 0;
    }

    get baseType(){
        return "bool"
    }
}

export default ExoSwitchControl;