class StyleSheetHelper {
    constructor(builder) {
        this.builder = builder;
    }

    applyCSS() {
        let css = this.parseCSS();
        if (css) {
            const ID = 'exf-studio-css';
            const prevStyleSheet = document.getElementById(ID);
            if (prevStyleSheet) prevStyleSheet.remove();

            const cssSheet = document.createElement("style");
            cssSheet.setAttribute("id", ID);
            cssSheet.innerHTML = css;
            document.head.appendChild(cssSheet);
        }
    }

    parseCSS() {
        try {
            let cssPanel = this.builder.sidePanel.tabStrip.tabs.css.panel;
            let css = xo.control.get(cssPanel.querySelector('[data-field-type="aceeditor"]')).value;
            let rules = xo.dom.parseCSS(css);
            let ar = [];
            for (var i = 0; i < rules.length; i++) {
                let r = rules[i]
                ar.push('#xfb ' + r.cssText);
            };
            let style = ar.join('\n');
            return style
        }
        catch (ex) {
            console.warn("Could not parse CSS: " + ex.toString())
        }
        return "";
    }

    buildCssFromClasses() {
        let ar = [];

        for (var c in xo.form.factory.html.classes) {
            ar.push(xo.dom.format(
                ` 
/* {{name}} */
.{{value}} {

}`, {
                name: c,
                value: xo.form.factory.html.classes[c]
            })
            )
        }

        return ar.join('\n');
    }

}


export default StyleSheetHelper;