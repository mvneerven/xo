import ExoFormFactory from '../core/ExoFormFactory';

class ExoFormProgressBase {
    constructor(exo) {
        this.exo = exo;
        this.nav = exo.addins.navigation;
    }

    render() {
        this.exo.on(ExoFormFactory.events.page, e => {
            console.debug(this, "Paging", e);
        })
    }
}

export default ExoFormProgressBase;
