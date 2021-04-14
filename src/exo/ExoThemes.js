

class ExoTheme {

    // exf-base-text
    fieldTemplate = /*html*/
`<div data-id="{{id}}" class="exf-ctl-cnt {{class}}">
    <label title="{{caption}}">
        <div class="exf-caption">{{caption}}</div>
        <span data-replace="true"></span>
    </label>
</div>`;

    constructor(name) {
        this.name = name;
    }
}

class Fluent extends ExoTheme {
    constructor(name) {
        super(name);
    }
}   

class ExoThemes {
    static fluent = new Fluent("fluent");
}

export default ExoThemes;