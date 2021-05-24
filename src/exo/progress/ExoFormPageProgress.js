import ExoFormDefaultProgress from './ExoFormDefaultProgress';

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

export default ExoFormPageProgress;