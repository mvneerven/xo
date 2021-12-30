import DOM from '../../pwa/DOM';

class ExoFormTheme {
    constructor(exo) {
        this.exo = exo;

        this.exo.on("interactive", this.correctPrefixAndSuffixPositions.bind(this))
        this.exo.on("page", this.correctPrefixAndSuffixPositions.bind(this))

    }

    correctPrefixAndSuffixPositions(e) {
        this.exo.container.querySelectorAll(".exf-txt-psx-span").forEach(span => {
            const container = span.closest(".exf-ctl")
            const input = container?.querySelector("input");
            if (input) {
                const containerRect = container.getBoundingClientRect();
                const presufRect = span.getBoundingClientRect();
                let inputRect = input.getBoundingClientRect();
                let top = (inputRect.top - containerRect.top) + (inputRect.height / 2 - presufRect.height / 2);
                span.style.top = top + "px";
            }
        })
    }

    apply() {
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
    // apply() {
    //     super.apply();
    //     this.exo.container.classList.add("exf-theme-fluent")
    // }
}

class ExoFormThinTheme extends ExoFormTheme {
    // apply() {
    //     super.apply();
    //     this.exo.container.classList.add("exf-theme-rounded")
    // }
}


class ExoFormMaterialTheme extends ExoFormTheme {
    // apply() {
    //     super.apply();
    //     this.exo.container.classList.add("exf-theme-material");
    // }
}

class ExoFormThemes {
    static types = {
        auto: undefined,
        none: ExoFormTheme,
        fluent: ExoFormFluentTheme,
        material: ExoFormMaterialTheme,
        thin: ExoFormThinTheme
    }

    static getType(exo) {
        let type = exo.schema.theme || exo.context?.config?.defaults?.theme;

        if (typeof (type) === "undefined" || type === "auto")
            type = ExoFormThemes.matchTheme(exo);

        let theme = ExoFormThemes.types[type];

        return {
            name: type,
            type: theme || ExoFormTheme
        }
    }

    static matchTheme(exo) {
        return "material"
    }
}

export default ExoFormThemes;
