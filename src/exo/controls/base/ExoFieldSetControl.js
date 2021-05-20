import ExoFormPageControl from './ExoFormPageControl';
import ExoForm from '../../ExoForm';
import DOM from '../../../pwa/DOM';

class ExoFieldSetControl extends ExoFormPageControl {
    constructor(context) {
        super(context);


        this._index = context.field.index;

        this.acceptProperties(
            {
                name: "legend",
                description: "The legend of the page",
                type: String
            },
            {
                name: "intro",
                description: "The intro of the page",
                type: String
            },
            {
                name: "index",
                description: "Number of the page (1-based)",
                type: Number
            }
        )

        this.htmlElement = DOM.parseHTML(`<fieldset class="exf-cnt exf-page"></fieldset>`);

        if (this.legend) {
            this.appendChild(
                DOM.parseHTML(DOM.format(ExoForm.meta.templates.legend, {
                    legend: this.legend
                }))
            );
        }

        if (this.intro) {
            this.appendChild(
                DOM.parseHTML(DOM.format(ExoForm.meta.templates.pageIntro, {
                    intro: this.intro
                }))
            );
        }
    }

    get index() {
        return this._index;
    }

    set index(value) {
        if (typeof (value) !== "number")
            throw "Page index must be a number";

        if (value < 1 || value > this.context.exo.schema.pages.length)
            throw "Invalid page index";

        this._index = value;
    }

    async render() {
        await super.render();



        if (this.index === this.context.exo.addins.navigation.currentPage) {
            this.htmlElement.classList.add("active");
        }

        this.htmlElement.setAttribute("data-page", this.index)

        return this.container;
    }
}

export default ExoFieldSetControl;