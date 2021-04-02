import ExoFormFactory from './ExoFormFactory';
import DOM from '../pwa/DOM'
import ExoRouteModule from './ExoRouteModule';

class ExoWizardRouteModule extends ExoRouteModule {

    title = "Wizard";

    menuIcon = "ti-wand";

    formLoaded() { } // for subclassing

    wizardRendered() {  } // for subclassing

    post(obj) {
        alert(JSON.stringify(obj, null, 2))
    }

    event(e) { }

    unload() {
        this.app.UI.areas.main.clear();

        // clean up wizard progress
        let wp = document.querySelector(".exf-wiz-step-cnt");
        if (wp) wp.remove();
        document.body.classList.remove("exf-fs-progress");
    }

    render() {
        const _ = this;

        _.engine = _.exoContext.createForm()
            .on(ExoFormFactory.events.post, e => {
                _.post(e.detail.postData)
            });

        
        let u = new URL(_.wizardSettings.url, _.app.config.baseUrl).toString();

        _.engine.load(u).then(x => {

            _.formLoaded()

            x.addEventListener(ExoFormFactory.events.page, (e) => {
                DOM.changeHash(_.path + "/page/" + e.detail.page);
            })


            x.renderForm().then(x => {
                console.log("Ready rendering wizard");

                _.app.UI.areas.main.clear();
                _.app.UI.areas.main.add(x.container);

                _.wizardRendered(x);
            })

        });

    }
}

export default ExoWizardRouteModule;

