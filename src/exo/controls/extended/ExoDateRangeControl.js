import ExoMultiInputControl from './ExoMultiInputControl';

class ExoDateRangeControl extends ExoMultiInputControl {

    columns = "14rem 14rem "

    areas = "'from to'"

    
    get fields ()  {
        return {
            from: { caption: "From", type: "date" },
            to: { caption: "To", type: "date" }
        }
    }

    set fields(value){
        // NA
    }

    async render() {
        let element = await super.render();

        let _from = this.controls.from.htmlElement;
        let _to = this.controls.to.htmlElement;

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