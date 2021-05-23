import ExoFormNavigationBase from './ExoFormNavigationBase';
import ExoFormFactory from '../core/ExoFormFactory';

class ExoFormStaticNavigation extends ExoFormNavigationBase {
    render() {
        super.render();

        this.exo.on(ExoFormFactory.events.renderReady, e => {

            //TODO fix this 
            setTimeout(() => {
                this.form.querySelectorAll(".exf-page").forEach(elm => {
                    elm.style.display = "block";
                });
            }, 50);

        })

    }
}

export default ExoFormStaticNavigation;