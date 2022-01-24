import DOM from '../../pwa/DOM';
import ExoFormFactory from '../core/ExoFormFactory';

class ExoFormNavigationBase {
    controls = [];

    constructor(exo) {
        this.exo = exo;
        this._visible = true;
        this._currentPage = 1;
        this.form = exo.form;

    }

    get visible() {
        return this._visible;
    }

    set visible(value) {
        this._visible = value;
        let cnt = this.form.querySelector(".exf-nav-cnt");
        if (cnt) DOM[this._visible ? "show" : "hide"]();
    }

    clear() {
        let cnt = this.form.querySelector(".exf-nav-cnt");
        if (cnt) cnt.remove();
    }

    async render() {
        const tpl = /*html*/`<fieldset class="exf-cnt exf-nav-cnt"></fieldset>`;

        this.container = DOM.parseHTML(tpl);

        return new Promise((resolve, reject) => {

            this.renderButtons().then(() => {
                this.form.appendChild(this.container);

                this.form.setAttribute("data-current-page", this.currentPage);

                this.form.querySelector(".exf-cnt.exf-nav-cnt").addEventListener("click", e => {

                    let btn = e.target.closest("[name]")
                    if (!btn)
                        return;

                    switch (btn.name) {
                        case "reset":
                            e.preventDefault();
                            this.restart();
                            break;

                        case "next":
                            e.preventDefault();
                            this.next();
                            break;
                        case "prev":
                            e.preventDefault();
                            this.back();
                            break;

                        case "send":
                            e.preventDefault();
                            this.exo.submitForm();
                            break;
                    }

                })

                this.exo.on(ExoFormFactory.events.page, e => {
                    this.updatecontrolstates()
                });

                this.exo.on(ExoFormFactory.events.pageRelevancyChange, e => {
                    this._pageCount = this.getLastPage();
                    this.updatecontrolstates()
                })

                this.exo.form.addEventListener("change", e => {
                    this.updatecontrolstates()
                });
                if (this.exo.options.DOMChange === "input") {
                    this.exo.form.addEventListener("input", e => {
                        this.updatecontrolstates()
                    });
                }

                this.exo.on(ExoFormFactory.events.interactive, this._ready.bind(this));

                resolve();
            });
        });



    }

    renderButtons() {
        return new Promise((resolve, reject) => {
            if (Array.isArray(this.exo.schema.controls)) {
                this.controls = this.exo.schema.controls;
            }

            let rendered = 0, count = this.controls.length;

            if (count === 0) { // empty list of controls
                if (rendered === count)
                    resolve();
            }
            this.controls.forEach(b => {
                this.addButton(b).then(btn => {
                    
                    let field = ExoFormFactory.getFieldFromElement(btn);
                    b._control = field._control;
                    b._control._rendered = true;
                    
                    //let control = xo.control.get(btn);
                    // xo.control.register(btn, control)
                    //  b._control = control;
                    //  b._control._rendered = true;
                    rendered++;
                    if (rendered === count)
                        resolve();
                });
            })
        });


    }

    _ready(e) {
        this._pageCount = this.getLastPage();
        this.updatecontrolstates()
    }

    canMove(fromPage, toPage) { // to be subclassed

        if (toPage > fromPage) {
            if (!this.exo.addins.validation.isPageValid(fromPage)) {
                return false;
            }
            let np = this._getNextPage(1, fromPage);
            if (np === undefined)
                return false;

            return true;
        }
        else {
            return toPage >= 1;
        }
    }

    async addButton(options) {
        options = {
            type: "button",
            ...options || {}
        }
        let btn = await this.exo.renderSingleControl(options);

        if (btn.querySelector("button").name !== "send" || this.exo.schema.submit !== false)
            this.container.appendChild(btn);
        

        return btn;
    }

    preventAutoButtonStates() {
        this._noUpdatecontrolstates = true;
    }

    _updateView(add, page) {
        if (!page && add === 0)
            return;

        let current = this.currentPage;

        if (add > 0 && current > 0) {
            if (!this.exo.addins.validation.isPageValid(this.currentPage)) {
                this.exo.addins.validation.reportValidity(this.currentPage);
                return;
            }
        }

        if (add !== 0)
            page = this.currentPage;// parseInt("0" + this.form.getAttribute("data-current-page")) || 1;

        page = this._getNextPage(add, page)

        this._pageCount = this.getLastPage();

        this._currentPage = page;

        if (current > 0) {
            if (page && current !== page && !this.canMove(current, page))
                return;

            let returnValue = this.exo.events.trigger(ExoFormFactory.events.beforePage, {
                from: current,
                page: page,
                pageCount: this.pageCount
            });

            if (returnValue === false)
                return;
        }

        this.form.setAttribute("data-current-page", this.currentPage);
        this.form.setAttribute("data-page-count", this.exo.schema.pages.length);
        this._currentPage = page;

        let i = 0;


        this.form.querySelectorAll('.exf-page[data-page]').forEach(p => {
            i++;
            p.classList[i === page ? "add" : "remove"]("active");
        });

        this.update();

        this.exo.events.trigger(ExoFormFactory.events.page, {
            from: current,
            page: page,
            pageCount: this.pageCount
        });

        return page;
    }

    /**
     * Moves to the next page in a multi-page form.
     */
    next() {
        this._updateView(+1);
    }

    /**
     * Moves to the previous page in a multi-page form.
     */
    back() {
        this._updateView(-1);
    }

    /**
     * Moves to the first page in a multi-page form.
     */
    restart() {
        this.goto(1);
    }

    /**
     * Moves to the given page in a multi-page form.
     */
    goto(page) {
        return this._updateView(0, page);
    }

    canMoveNext() {
        return this.canMove(this.currentPage, this.currentPage + 1)
    }

    get currentPage() {
        if (!this._currentPage) this._currentPage = 1;
        return this._currentPage;
    }

    get pageCount() {
        if (!this._pageCount) this._pageCount = this.getLastPage();

        return this._pageCount;
    }

    _getNextPage(add, page) {
        let ok = false;

        var skip;
        do {

            page += add;

            if (page > this.exo.schema.pages.length) {
                return undefined;
            };

            let pgElm = this.form.querySelector('.exf-page[data-page="' + page + '"]');
            if (pgElm) {
                skip = pgElm.getAttribute("data-skip") === "true";
                if (!skip) {
                    ok = true;
                }
            }
            else {
                ok = true;
                return undefined;
            }

            if (add === 0)
                break;

        } while (!ok)

        if (page < 1) page = 1;

        return page;
    }

    getLastPage() {

        let pageNr = parseInt("0" + this.form.getAttribute("data-current-page")) || 1
        let lastPage = 0;
        let nextPage = -1;
        do {
            nextPage = this._getNextPage(+1, pageNr);
            if (nextPage) {
                lastPage = nextPage;
                pageNr = nextPage;
            }

        } while (nextPage)

        return lastPage || pageNr || 1;
    }

    getControl(name) {
        let field = this.controls.find(c => {
            return c.name === name;
        });
        if (field) {
            return field._control;
        }
    }

    updatecontrolstates() {
        if (this._noUpdatecontrolstates)
            return;

        let prev = this.getControl("prev");
        if (prev)
            prev.disabled = this.currentPage < 2;

        let nxt = this.getControl("next");
        if (nxt) {
            if (this.currentPage === this.pageCount) {
                nxt.visible = false;
            }
            else {
                nxt.visible = true;
                nxt.disabled = !this.canMoveNext()
            }
        }

        let send = this.getControl("send");
        if (send) {
            let valid = this.exo.addins.validation.checkValidity();
            send.disabled = !valid;
        }
    }

    update() { }
}

export default ExoFormNavigationBase;