const DOM = window.xo.dom;
const Core = window.xo.core;

class HomeRoute extends xo.route {
    title = "The xo Series - eXtra Ordinary Vanilla JS";
    menuTitle = "Home";
    menuIcon = "ti-home";


    init(){
        this.app.on("pwa.unload", e => {
            
            //e.preventDefault();
        })
    }

    unload() {
        this.app.UI.areas.main.clear();
    }

    async render() {
        let data = document.querySelector("#main-data").innerHTML;
        this.app.UI.areas.main.add(DOM.parseHTML(data));
    }
}

export default HomeRoute;