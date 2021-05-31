import ExoBaseControls from '../base/ExoBaseControls';

class ExoTaggingControl extends ExoBaseControls.controls.text.type {

    max = null;

    duplicate = false;

    wrapperClass = 'exf-tags-input';

    tagClass = 'tag';

    // Initialize elements
    arr = [];

    constructor(context) {
        super(context)

        this.wrapper = document.createElement('div');
        this.input = document.createElement('input');
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
                type: Array
            })
    }

    async render() {
        const me = this;
        this.wrapper.classList.add(this.wrapperClass);

        await super.render();
        this.htmlElement.parentNode.insertBefore(this.wrapper, this.htmlElement);

        this.htmlElement.setAttribute('type', 'hidden');
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

        this.input.addEventListener('keydown', e => {
            var str = this.input.value.trim();
            if (!!(~[9, 13, 188].indexOf(e.keyCode))) {
                e.preventDefault();
                e.stopPropagation();
                e.returnValue = false;

                this.input.value = "";
                if (str !== "") {
                    this.addTag(str);
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

        // if (Array.isArray(this.value)) {
        //     this.value.forEach(t => {
        //         this.addTag(t);
        //     })
        // }

        this.container.classList.add("exf-std-lbl");

        return this.container;
    }

    get value() {
        return this.arr;
    }

    set value(data) {
        if (!data)
            return;

        if (!Array.isArray(data))
            throw "Data for tags control must be array";

        if (this.rendered) {
            this.wrapper.innerHTML = "";
        }
            
            data.forEach(t => {
                this.addTag(t);
            })
        //}
    }

    // Add Tag
    addTag(tagName) {
        if (this.anyErrors(tagName)) return;

        this.arr.push(tagName);

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
        this.triggerChange();
        return this;
    }

    // Delete Tag
    deleteTag(tag, i) {
        tag.remove();
        this.arr.splice(i, 1);
        this.triggerChange()
        return this;
    }

    // override ExoControlBase.triggerChange - dispatch event on htmlElement fails 
    // for some reason - disspatching on visual tag input
    triggerChange() {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", true, true);
        evt.detail = { field: "tags" };
        this.input.dispatchEvent(evt);
    }

    // Errors
    anyErrors(string) {
        if (this.max != null && this.arr.length >= this.max) {
            return true;
        }

        if (!this.duplicate && this.arr.indexOf(string) != -1) {
            return true;
        }

        return false;
    }


    addData(array) {
        var plugin = this;

        array.forEach(function (string) {
            plugin.addTag(string);
        })
        return this;
    }
}

export default ExoTaggingControl;