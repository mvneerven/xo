
class ExoFormProgressBase {
    constructor(exo) {
        this.exo = exo;
        this.nav = exo.addins.navigation;
    }

    render() {
        // for subclassing
    }
}

export default ExoFormProgressBase;
