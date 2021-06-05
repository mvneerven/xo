import ExoMultiInputControl from './ExoMultiInputControl';

class ExoDateRangeControl extends ExoMultiInputControl {
    grid = "exf-cols-10em-10em";

    fields = {
        from: { caption: "From", type: "date" },
        to: { caption: "To", type: "date" }
    }

    async render() {
        let element = await super.render();

        let _from = this.inputs.from.querySelector("[name]")
        let _to = this.inputs.to.querySelector("[name]");

        const check = e => {
            if (e.target === _from) {
                _to.setAttribute("min", _from.value)
            }
            else if (e.target === _to) {
                _from.setAttribute("max", _to.value)
            }
        }

        _from.addEventListener("change", check)
        _to.addEventListener("change", check)

        return element;
    }

}

export default ExoDateRangeControl;