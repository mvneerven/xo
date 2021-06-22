const DOM = window.xo.dom;

class StyleSheetHelper{

    constructor(builder){
        this.builder = builder;
    }

    applyCSS() {
        let css = this.parseCSS();
        if (css) {
            this.cssSheet = document.createElement('style')
            this.cssSheet.innerHTML = css;
            document.body.appendChild(this.cssSheet);
        }
    }

    removeCSS() {
        if (this.cssSheet)
            this.cssSheet.remove()
    }

    parseCSS() {
        try {
            let cssPanel = this.builder.sidePanel.tabStrip.tabs.css.panel;
            
            let css = cssPanel.querySelector('[data-type]').data.editor.getValue();
            let rules = DOM.parseCSS(css);
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

        for (var c in window.xo.form.factory.html.classes) {
            ar.push(DOM.format(
                ` 
/* {{name}} */
.{{value}} {

}`, {
                name: c,
                value: window.xo.form.factory.html.classes[c]
            })
            )
        }

        return ar.join('\n');
    }

}


export default StyleSheetHelper;