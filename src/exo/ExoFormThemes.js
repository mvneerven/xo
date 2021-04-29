import DOM from '../pwa/DOM';

class ExoFormTheme {
    // exf-base-text
    containerTemplate1 = /*html*/
        `<div data-id="{{id}}" class="exf-ctl-cnt {{class}}">
    <label title="{{caption}}">
        <div class="exf-caption">{{caption}}</div>
        
        <span data-replace="true"></span>
    </label>
</div>`;

    containerTemplate = /*html*/
        `<div data-id="{{id}}" class="exf-ctl-cnt {{class}}">
    <div class="exf-ctl">
        <label aria-hidden="true" class="exf-label" title="{{caption}}">Key</label>
        <span data-replace="true"></span>
    </div>
    <div class="exf-fld-details">
        <div class="exf-help-wrapper"></div>
    </div>
</div>`;

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
        let type = exo.formSchema.theme;
        if (type === "auto" || type === undefined)
            type = ExoFormThemes.matchTheme(exo);

        let theme = ExoFormThemes.types[type];

        return theme || ExoFormTheme;
    }

    static matchTheme(exo) {
        return "material"
    }
}

export default ExoFormThemes;
