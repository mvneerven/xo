import ExoFormDefaultNavigation from './ExoFormDefaultNavigation';
import ExoFormFactory from '../core/ExoFormFactory';
import ULTabStrip from '../../pwa/ULTabStrip';

class ExoFormTabStripNavigation extends ExoFormDefaultNavigation {
    async render() {
        this.exo

            .on(ExoFormFactory.events.renderReady, e => {
                const tsOptions = {
                    tabs: {}
                }

                this.exo.schema.pages.forEach(p => {
                    tsOptions.tabs[`tab${p.index}`] = {
                        caption: p.legend || "Tab " + p.index,
                        class: "height-content"
                    }
                })
                let wrapper = this.exo.form.querySelector(".exf-wrapper");
                const ts = new ULTabStrip(this.exo.id, tsOptions);
                this.tabStripElm = ts.render();
                this.tabStripElm.classList.add("exf-nav-tabs")
                wrapper.appendChild(this.tabStripElm)
                this.exo.form.querySelectorAll(".exf-page").forEach(p => {
                    p.querySelectorAll(".exf-page-title").forEach(e => {
                        e.remove()
                    })

                    let index = p.getAttribute("data-page");
                    let tabName = `tab${index}`;
                    ts.tabs[tabName].panel.appendChild(p);
                });

                //this.navDiv = this.exo.form.querySelector(".exf-nav-cnt");
                //wrapper.appendChild(this.navDiv);
            })

            .on(ExoFormFactory.events.interactive, e => {
                
                this.form.querySelectorAll(".exf-page").forEach(elm => {
                    elm.style.display = "block";
                });

                //this.navDiv = this.exo.form.querySelector(".exf-nav-cnt");
                //this.navDiv.style = `position:absolute; top: 0px; right: 0`;

            });

        await super.render();
    }
}

export default ExoFormTabStripNavigation;