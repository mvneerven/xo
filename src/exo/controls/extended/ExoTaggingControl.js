import ExoBaseControls from '../base';
import ExoTextControlAutoCompleteExtension from '../base/ExoTextControlAutoCompleteExtension';

class ExoTaggingControl extends ExoBaseControls.controls.text.type {
    max = null;

    duplicate = false;

    wrapperClass = 'exf-tags-input';

    tagClass = 'tag';


    constructor(context) {
        super(context)

        this.wrapper = document.createElement('div');
        this.input = document.createElement('input');
        this.input.addEventListener("result-selected", e => {
            this.addTag(e.detail.text);
            //isRestrictedToAutoComplete
            this.input.value="";
        })

        this.wrapper.append(this.input);

        this.acceptProperties(
            {
                name: "max",
                type: Number,
                description: "Maximum number of tags allowed"
            },
            {
                name: "duplicate",
                type: Boolean,
                description: "Allow duplicates. Default false"
            },
            {
                name: "value",
                description: "Tag names to set (array)",
                demoValue: ["Good", "Bad", "Ugly"],
                type: Array
            },
            {
                name: "autocomplete",
                type: Object,
                description: `Object describing autocompletion settings.

                - autocomplete: {items: ["Mr", "Mrs", "Ms"]}
                - autocomplete: this.myAutoCompleteProvider.bind(this)
                - autocomplete: {
                    items: "https://restcountries.eu/rest/v2/name/%search%",
                    map: "name",
                    minlength: 2,
                    max: 5
                  }`
            }
        )
    }

    async render() {
        const me = this;
        this.wrapper.classList.add(this.wrapperClass);

        await super.render();
        try {
            this._rendered = false;
            this.renderTags();

            this.htmlElement.parentNode.insertBefore(this.wrapper, this.htmlElement);

            this.htmlElement.setAttribute('type', 'hidden'); 1
            this.htmlElement.addEventListener("change", e => {
                if (!e.detail) {
                    e.stopImmediatePropagation();
                    e.cancelBubble = true;
                    e.preventDefault();
                    e.stopPropagation();
                    e.returnValue = false;
                }

            })

            this.wrapper.addEventListener('click', function (e) {
                let inp = me.container.querySelector("input");
                inp.focus();
            });

            this.input.addEventListener('keyup', e => {


                if (!!(~[9, 13, 188].indexOf(e.keyCode))) {
                    if (!this.isRestrictedToAutoComplete && !this.preventEnter) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.returnValue = false;
                        const str = this.input.value.trim();
                        this.input.value = "";
                        if (str !== "") {
                            this.addTag(str);
                        }
                    }
                }
                else if (e.key === 'Backspace') {
                    if (this.input.value === "") {
                        let tags = this.wrapper.querySelectorAll(".tag")
                        if (tags.length) {
                            let i = tags.length - 1;
                            this.deleteTag(tags[i], i);
                        }
                    }
                }
            });

            this.container.classList.add("exf-std-lbl");

            return this.container;
        }
        finally {
            this._rendered = true
        }
    }

    set autocomplete(obj) {
        this.autoCompleteInput = this.input; // contrary to text control

        this._autoComplete = new ExoTextControlAutoCompleteExtension(this, obj);
    }

    get autocomplete() {
        return this._autoComplete;
    }

    get isRestrictedToAutoComplete() {
        return this.autocomplete?.settings.strict;
    }

    renderTags() {

        this.value.forEach(t => {

            // if (this.anyErrors(t)) return;

            this.addTag(t)
        })
    }

    get value() {

        if (!this._value || !Array.isArray(this._value))
            this._value = []

        return this._value;
    }

    set value(data) {

        if (!data)
            return;

        if (!Array.isArray(data))
            throw TypeError("Data for tags control must be array");

        this._value = data;
    }

    // Add Tag
    addTag(tagName) {
        if (this.rendered) {
            if (this.anyErrors(tagName)) return;
            this.value.push(tagName)
        }

        var tag = document.createElement('span');
        tag.className = this.tagClass;
        tag.textContent = tagName;

        var closeIcon = document.createElement('a');
        closeIcon.innerHTML = '&times;';
        closeIcon.addEventListener('click', event => {
            event.preventDefault();
            var tag = event.target.parentNode;

            for (var i = 0; i < this.wrapper.childNodes.length; i++) {
                if (this.wrapper.childNodes[i] == tag)
                    this.deleteTag(tag, i);
            }
        });

        tag.appendChild(closeIcon);

        this.wrapper.insertBefore(tag, this.input);

        if (this.rendered)
            this.triggerChange();

        return this;
    }

    // Delete Tag
    deleteTag(tag, i) {
        tag.remove();
        this.value.splice(i, 1);
        this.triggerChange()
        return this;
    }

    // override ExoControlBase.triggerChange - dispatch event on htmlElement fails 
    // for some reason - disspatching on visual tag input
    triggerChange() {
        var evt = new Event("change", { bubbles: true, cancelable: true })
        evt.detail = { field: "tags" };
        this.input.dispatchEvent(evt);
    }

    // Errors
    anyErrors(string) {
        if (this.max != null && this.value.length >= this.max) {
            return true;
        }

        if (!this.duplicate && this.value.indexOf(string) != -1) {
            return true;
        }

        return false;
    }
}

export default ExoTaggingControl;