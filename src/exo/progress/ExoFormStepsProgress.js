import ExoFormDefaultProgress from './ExoFormDefaultProgress';
import DOM from '../../pwa/DOM';
import ExoFormFactory from '../core/ExoFormFactory';

class ExoFormStepsProgress extends ExoFormDefaultProgress {

    container = null;

    templates = {
        progressbar: /*html*/`
            <nav class="exf-wiz-step-cnt">
                <div class="step-wizard" role="navigation">
                <div class="progress">
                    <div class="progressbar empty"></div>
                    <div class="progressbar prog-pct"></div>
                </div>
                <ul>
                    {{inner}}
                </ul>
                </div>
                
            </nav>`,
        progressstep: /*html*/`
            <li class="">
                <button type="button" id="step{{step}}">
                    <div class="step">{{step}}</div>
                    <div class="title">{{pagetitle}}</div>
                </button>
            </li>`
    }

    render() {
        super.render();

        this.container = DOM.parseHTML(this.templates.progressbar.replace("{{inner}}", ""));
        this.ul = this.container.querySelector("ul");

        let nr = 0;
        this.exo.schema.pages.forEach(p => {
            nr++;
            this.ul.appendChild(DOM.parseHTML(DOM.format(this.templates.progressstep, {
                step: nr,
                pagetitle: p.legend
            })));
        });

        this.container.querySelectorAll(".step-wizard ul button").forEach(b => {
            b.addEventListener("click", e => {
                var step = parseInt(b.querySelector("div.step").innerText);
                this.exo.addins.navigation[step > 0 ? "next" : "back"]();
            })
        });

        this.exo.on(ExoFormFactory.events.page, e => {
            this.setClasses()
        })

        this.exo.container.insertBefore(this.container, this.exo.form);
    }

    setClasses() {
        let index = this.nav.currentPage;
        let steps = this.nav.getLastPage();

        if (!this.container)
            return;

        if (index < 0 || index > steps) return;

        var p = (index - 1) * (100 / steps);

        let pgb = this.container.querySelector(".progressbar.prog-pct");
        if (pgb)
            pgb.style.width = p + "%";

        var ix = 0;
        this.container.querySelectorAll("ul li").forEach(li => {
            ix++;
            li.classList[ix === index ? "add" : "remove"]("active");

            li.classList[this.exo.addins.validation.isPageValid(ix) ? "add" : "remove"]("done");

        });

        this.container.querySelectorAll(".exf-wiz-step-cnt .step-wizard li").forEach(li => {
            li.style.width = (100 / (steps)) + "%";
        })

    }
}

export default ExoFormStepsProgress;