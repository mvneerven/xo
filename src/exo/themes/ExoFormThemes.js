import DOM from '../../pwa/DOM';

class ExoFormTheme {
    constructor(exo) {
        this.exo = exo;
    }

    apply() {
        this.exo.container.classList.add("exf-theme-none")

        this.exo.form.addEventListener("focusin", e => {
            let cnt = e.target.closest(".exf-ctl-cnt");
            if (cnt) cnt.classList.add("exf-focus");
        })
        this.exo.form.addEventListener("focusout", e => {
            let cnt = e.target.closest(".exf-ctl-cnt");
            if (cnt) {
                cnt.classList.remove("exf-focus");
                if (e.target.value == '') {
                    cnt.classList.remove('exf-filled')
                }
            }
        })

        this.exo.form.addEventListener("input", e => {
            let c = e.target;
            let cnt = c.closest(".exf-ctl-cnt");
            if (cnt) cnt.classList[c.value ? "add" : "remove"]("exf-filled");
        });

    }
}

class ExoFormFluentTheme extends ExoFormTheme {
    apply() {
        super.apply();
        this.exo.container.classList.add("exf-theme-fluent")
    }
}

class ExoFormMaterialTheme extends ExoFormTheme {
    apply() {
        super.apply();
        this.exo.container.classList.add("exf-theme-material");

        this.exo.form.querySelectorAll("[name][placeholder]").forEach(elm => {
            elm.setAttribute("data-placeholder", elm.getAttribute("placeholder") || "");
            elm.removeAttribute("placeholder")
        });

        this.exo.form.addEventListener("focusin", e => {
            e.target.setAttribute("placeholder", e.target.getAttribute("data-placeholder") || "");
        })
        this.exo.form.addEventListener("focusout", e => {
            e.target.removeAttribute("placeholder")
        })
    }
}

class ExoFormThemes {
    static types = {
        auto: undefined,
        none: ExoFormTheme,
        fluent: ExoFormFluentTheme,
        material: ExoFormMaterialTheme
    }

    static getType(exo) {
        let type = exo.schema.theme;
        if (typeof(type) === "undefined" || type === "auto" )
            type = ExoFormThemes.matchTheme(exo);

        let theme = ExoFormThemes.types[type];

        return theme || ExoFormTheme;
    }

    static matchTheme(exo) {
        return "material"
    }
}

export default ExoFormThemes;
