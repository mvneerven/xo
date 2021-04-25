import DOM from '../pwa/DOM';

class ExoFormTheme {
    // exf-base-text
    fieldTemplate = /*html*/
        `<div data-id="{{id}}" class="exf-ctl-cnt {{class}}">
    <label title="{{caption}}">
        <div class="exf-caption">{{caption}}</div>
        <span data-replace="true"></span>
    </label>
</div>`;

    constructor(exo) {
        this.exo = exo;
    }

    apply() {
        this.exo.container.classList.add("exf-theme-none")
    }
}

class ExoFormFluentTheme extends ExoFormTheme {
    constructor(name) {
        super(name);
    }

    apply() {
        this.exo.container.classList.add("exf-theme-fluent")
    }
}

class ExoFormThemes {
    static types = {
        auto: undefined,
        none: ExoFormTheme,
        fluent: ExoFormFluentTheme
    }

    static getType(exo) {
        let type = exo.formSchema.theme;
        if (type === "auto" || type === undefined)
            type = ExoFormThemes.matchTheme(exo);

        let theme = ExoFormThemes.types[type];

        return theme || ExoFormTheme;
    }

    static matchTheme(exo) {
        return "fluent"
    }
}

export default ExoFormThemes;
