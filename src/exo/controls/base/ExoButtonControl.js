
import ExoElementControl from './ExoElementControl';
import DOM from '../../../pwa/DOM';

class ExoButtonControl extends ExoElementControl {
    constructor(context) {
        super(context);

        this._useContainer = false; // no container by default
        
        this.iconHtml = "";
        
        this.htmlElement = DOM.parseHTML('<button class="exf-btn" />')

        this.acceptProperties(
            {
                name: "icon",
                description: "Icon class to be used (using a span)"
            },
            {
                name: "click",
                description: "Click method"
            },
            {
                name: "action",
                description: `Possible values: 
                    - 'next' (next page in Wizard)
                    - 'reset' (back to first page)
                    - 'goto:[page]' (jump to given page)
                `
            });
    }

    async render() {
        const _ = this;
        await super.render();



        if (_.icon) {
            _.htmlElement.appendChild(DOM.parseHTML('<span class="' + _.icon + '"></span>'))
            this.htmlElement.appendChild(document.createTextNode(' '));
        }

        _.htmlElement.appendChild(DOM.parseHTML(`<span class="exf-caption">${this.caption}</span>`))

        let elm = await super.render();

        _.htmlElement.addEventListener("click", e => {
            if (_.click) {
                let data = _.context.exo.getFormValues();
                let f = _.click;
                if (typeof (f) !== "function") {
                    f = _.context.exo.options.customMethods[f];
                }
                if (typeof (f) !== "function") {
                    if (_.context.exo.options.host) {
                        if (typeof (_.context.exo.options.host[_.click]) === "function") {
                            f = _.context.exo.options.host[_.click];
                            f.apply(_.context.exo.options.host, [data, e]);
                            return;
                        }
                    }
                    else {
                        throw "Not a valid function: " + _.click
                    }
                }
                f.apply(_, [data, e]);
            }
            else if (_.action) {
                let actionParts = _.action.split(":");

                switch (actionParts[0]) {
                    case "next":
                        _.context.exo.addins.navigation.nextPage();
                        break;
                    case "reset":
                        _.context.exo.addins.navigation.goto(1);
                        break;

                    case "goto":
                        _.context.exo.addins.navigation.goto(parseInt(actionParts[1]));
                        break;
                }
            }
        })

        this.container.classList.add("exf-btn-cnt");
        this.htmlElement.classList.add("exf-btn");

        return this.container;
    }

    set icon(value) {
        this._icon = value;
    }

    get icon() {
        return this._icon;
    }

}

export default ExoButtonControl;