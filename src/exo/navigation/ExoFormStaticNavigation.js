import ExoFormNavigationBase from './ExoFormNavigationBase';
import ExoFormFactory from '../core/ExoFormFactory';

class ExoFormStaticNavigation extends ExoFormNavigationBase {
    render() {
        super.render();
        this.exo.on(ExoFormFactory.events.interactive, e => {
            this.form.querySelectorAll(".exf-page").forEach(elm => {
                elm.style.display = "block";
            });
        })
    }
}

export default ExoFormStaticNavigation;