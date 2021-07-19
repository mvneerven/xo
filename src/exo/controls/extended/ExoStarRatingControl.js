import ExoBaseControls from '../base';
import DOM from '../../../pwa/DOM';

class ExoStarRatingControl extends ExoBaseControls.controls.range.type {

  static returnValueType = Number;

  constructor() {
    super(...arguments);

    if (!this.value)
      this.value = 2.5;

    this.acceptProperties(
      {
        name: "min",
        type: Number,
        default: 0
      },
      {
        name: "max",
        type: Number,
        default: 5
      },
      {
        name: "step",
        type: Number,
        default: 0.5
      }
    )

    this.htmlElement.style="--value:2.5"

  }

  async render() {
    this.htmlElement.setAttribute("min", this.min);
    this.htmlElement.setAttribute("max", this.max);
    this.htmlElement.setAttribute("step", this.step);

    const set = e => {
      e.target.style.setProperty('--value', `${e.target.valueAsNumber}`)
    }

    this.htmlElement.addEventListener("input", set);
    setTimeout(() => {
      set({target: this.htmlElement})  
    }, 10);

    const s = this.htmlElement.style;

    s.setProperty("--value", this.valueAsNumber);
    s.setProperty("--stars", this.max);

    await super.render();
    this.container.classList.add("exf-std-lbl");
    return this.container;
  }


}

export default ExoStarRatingControl;