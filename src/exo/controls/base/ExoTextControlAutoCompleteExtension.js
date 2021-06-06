import Core from '../../../pwa/Core'

class ExoTextControlAutoCompleteExtension {

    cssClasses = {
        result: "exf-ac-rs",
        item: "exf-ac-itm"
    }

    constructor(control, settings) {
        this.control = control;

        this.categories = settings.categories || {};

        if (!settings.items)
            throw TypeError("Must pass items array, function or promise in autocomplete settings");


        this.items = settings.items;
    }

    attach() {
        this.htmlElement = this.control.htmlElement
        this.container = this.control.container;

        const on = (a, b) => { this.htmlElement.addEventListener(a, b) };

        on("input", this.inputHandler.bind(this))
        on("click", this.clickHandler.bind(this))
        on("focusout", this.blurHandler.bind(this))
        on("keyup", this.keyUpHandler.bind(this));

        this.resultsDiv = document.createElement("div");
        this.resultsDiv.classList.add(this.cssClasses.result)
        this.resultsDiv.addEventListener("mousedown", this.resultClick.bind(this))
        this.container.appendChild(this.resultsDiv)
        this.clear();

        this.container.classList.add("autocomplete")

    }

    moveResult(add) {
        let all = this.resultsDiv.querySelectorAll("div");
        let length = all.length;
        this.rowIndex = this.rowIndex + add;

        if (this.rowIndex <= 0)
            this.rowIndex = 0;
        else if (this.rowIndex > length - 1) {
            this.rowIndex = 0;
        }
        all.forEach(r => {
            r.classList.remove("selected");
        })

        let div = this.getSelectedDiv();
        if (div)
            div.classList.add("selected")
        else {
            this.clickHandler();
        }

    }

    getSelectedDiv() {
        return this.resultsDiv.querySelector(`div:nth-child(${this.rowIndex + 1})`);
    }

    // execute action
    selectResult(div) {
        div = div || this.getSelectedDiv()
        if (div) {
            let index = parseInt(div.getAttribute("data-index"));
            this.resultClicked = true;
            let result = this.results[index];

            let handlingCategory = this.categories[result.category] || { action: this.setText.bind(this) };

            if (handlingCategory.newTab) {
                this.tabWindow = window.open('about:blank', '_blank'); // prevent popup blocking
            }

            let options = {
                ...result,
                search: this.htmlElement.value
            };

            div.classList.add("active");

            setTimeout(() => {
                handlingCategory.action(options)
                if (handlingCategory.newTab) {
                    if (options.url) {
                        this.tabWindow.location.href = options.url;
                    }
                    else {
                        this.tabWindow.close();
                    }
                }
                this.clear();
            }, 100);


        }
    }

    setText(options) {
        this.control.value = options.text;
        this.hide();
    }

    resultClick(event) {
        this.selectResult(event.target.closest(`.${this.cssClasses.item}`));
    }

    set categories(value) {
        this._categories = value;
    }

    get categories() {
        return this._categories || {}
    }

    blurHandler(e) {
        setTimeout(() => {
            if (!this.resultClicked)
                this.clear();

            this.resultClicked = false;
        }, 100);
    }

    clear() {
        this.resultsDiv.innerHTML = "";
        this.resultsDiv.style.display = 'none';
    }

    show() {
        this.resultsDiv.style.display = 'block';
    }

    hide() {
        this.resultsDiv.style.display = 'none';
    }

    inputHandler(e) {
        this.clear();
        let options = {
            search: e.target.value,
            categories: this.categories
        };

        this.getItems(options).then(r => {
            this.resultsHandler(r, options)
        })
    }

    keyUpHandler(e) {
        switch (e.keyCode) {
            case 40: // down
                this.moveResult(1);
                break;
            case 38: // up
                this.moveResult(-1);
                break;
            case 27:
                this.hide();
                break;
            case 13:
                this.selectResult()
                break;
            default:
                //this.toggle();
                break;
        }
    }

    clickHandler(e) {
        this.clear();
        const options = {
            suggest: true,
            search: e.target.value,
            categories: this.categories
        }
        this.getItems(options).then(r => {
            this.resultsHandler(r, options)
        })
    }

    resultsHandler(r, options) {
        this.results = r;
        this.rowIndex = -1;
        let index = 0;
        r.forEach(i => {
            this.resultsDiv.innerHTML += `<div data-index="${index}" class="${this.cssClasses.item}">
                <span class="${i.icon}"></span>
                <span class="text">${this.formatResultItem(i, options)}</span>
                <span class="category">${i.category || ""}</span></div>`;

            index++;
        });
        if (r.length) {
            this.show();
        }
    }

    formatResultItem(i, options) {
        let result = i.text;

        return result.replace("%search%", options.search)
    }

    async getItems(options) {
        //this.options = options;
        return new Promise(resolve => {
            if (Core.isUrl(this.items)) {
                fetch(this.items + "?" + this.createQueryParam(options)).then(x => {
                    if (x.status === 200) {
                        resolve(x.json());
                        return;
                    }
                    throw Error(`HTTP error ${x.status} - ${this.items}`);
                })
            }
            else if (Array.isArray(this.items)) {

                this.items = this.items.map(i => {
                    if (typeof (i) === "string") {
                        return { text: i }
                    }
                    return i;
                })

                resolve(this.items.filter(i => {
                    return this.isMatch(options, i)
                }));
            }
            else if (typeof (this.items) === "function") {
                resolve(this.items(options));
            }
            else {
                return resolve(Promise.resolve(this.items.apply(this, options)));
            }
        });
    }

    createQueryParam(options) {
        let suggest = options.suggest ? "&suggest=true" : "";
        return `q=${options.text}${suggest}`;
    }

    isMatch(options, i) {
        if (i.text.indexOf("%search%") >= 0)
            return true

        return options.search ? i.text.toLowerCase().indexOf(options.search.toLowerCase()) >= 0 : options.suggest;
    }

}


export default ExoTextControlAutoCompleteExtension;