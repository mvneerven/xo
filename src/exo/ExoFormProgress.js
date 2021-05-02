import DOM from '../pwa/DOM';
import ExoFormFactory from './ExoFormFactory';

class ExoFormNoProgress {
    constructor(exo) {
        this.exo = exo;
    }

    render() {
        this.exo.on(ExoFormFactory.events.page, e => {
            console.debug(this, "Paging", e);
        })
    }
}

class ExoFormDefaultProgress extends ExoFormNoProgress {

}

class ExoFormPageProgress extends ExoFormDefaultProgress {
    render() {
        super.render();

        let elms = this.exo.form.querySelectorAll(".exf-page:not([data-skip='true']) > legend");
        let index = 1;
        if (elms.length > 1) {
            elms.forEach(l => {
                l.innerHTML += ` <span class="exf-pg-prg">(${index}/${elms.length})</span>`;
                index++;
            })
        }
    }
}

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

        const _ = this;

        _.container = DOM.parseHTML(_.templates.progressbar.replace("{{inner}}", ""));
        _.ul = _.container.querySelector("ul");

        let nr = 0;
        _.exo.formSchema.pages.forEach(p => {
            nr++;
            _.ul.appendChild(DOM.parseHTML(DOM.format(this.templates.progressstep, {
                step: nr,
                pagetitle: p.legend
            })));
        });

        _.container.querySelectorAll(".step-wizard ul button").forEach(b => {
            b.addEventListener("click", e => {
                var step = parseInt(b.querySelector("div.step").innerText);
                _.exo[step > 0 ? "nextPage" : "previousPage"]();
            })
        });

        _.exo.on(window.xo.form.factory.events.page, e => {
            _.setClasses()
        })

        //return this.container;

        this.exo.container.insertBefore(this.container, this.exo.form);
    }

    setClasses() {
        const _ = this;

        let index = _.exo.currentPage;
        let steps = _.exo.getLastPage();

        if (!_.container)
            return;

        if (index < 0 || index > steps) return;

        var p = (index - 1) * (100 / steps);

        let pgb = _.container.querySelector(".progressbar.prog-pct");
        if (pgb)
            pgb.style.width = p + "%";

        var ix = 0;
        _.container.querySelectorAll("ul li").forEach(li => {
            ix++;
            li.classList[ix === index ? "add" : "remove"]("active");

            li.classList[_.exo.isPageValid(ix) ? "add" : "remove"]("done");

        });

        _.container.querySelectorAll(".exf-wiz-step-cnt .step-wizard li").forEach(li => {
            li.style.width = (100 / (steps)) + "%";
        })

    }
}

class ExoFormSurveyProgress extends ExoFormDefaultProgress {

}

class ExoFormProgress {
    static types = {
        auto: undefined,
        none: ExoFormNoProgress,
        default: ExoFormDefaultProgress,
        page: ExoFormPageProgress,
        steps: ExoFormStepsProgress,
        survey: ExoFormSurveyProgress
    }

    static getType(exo) {
        let type = exo.formSchema.progress;
        if (typeof(type) === "undefined" || type === "auto")
            type = ExoFormProgress.matchProgressType(exo);

        return ExoFormProgress.types[type];
    }


    static matchProgressType(exo) {
        if (exo.formSchema.pages.length > 1){
            if (exo.formSchema.navigation === "static")
                return "none"

            return "page"

        }

        return "default"
    }
}

export default ExoFormProgress;

