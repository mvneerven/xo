import DOM from './DOM';

class PWA_RouterMenu {
    constructor(router) {
        this.router = router;
    }

    generate(pwaArea, filter) {

        let nav = this.renderRouteMenu(filter);

        pwaArea.element.addEventListener("click", e => {

            if (e.target.closest("li")) {
                pwaArea.element.classList.add("clicked");

                if (!this.touchStarted) {
                    setTimeout(() => {
                        pwaArea.element.classList.remove("clicked");
                        this.touchStarted = false;
                    }, 1500);
                }
            }
        });

        // handle special mobile case to prevent pwaArea from opening 
        pwaArea.element.addEventListener("touchstart", e => {
            this.touchStarted = true;

            let pwaArea = e.target.closest("[data-pwa-area]");
            if (pwaArea) {
                if (e.target.closest("li")) {
                    pwaArea.classList.add("clicked");
                }
                else {
                    pwaArea.classList.remove("clicked");
                }
            }
        });

        this.menu = pwaArea;

        this.router.on("route", e => {
            this.updateGeneratedMenu(e.detail.module);
        })

        pwaArea.add(nav)

        this.updateGeneratedMenu(this.router.current);
        return pwaArea;
    }

    updateGeneratedMenu(module) {
        if (this.menu) {
            this.menu.element.querySelectorAll("li").forEach(li => {
                let selected = module.path === li.getAttribute("data-route");
                li.classList[selected ? "add" : "remove"]("selected")
            })
        }
    }

    renderRouteMenu(filter) {
        let ar = this.router.listModules(filter);

        let ul = document.createElement("ul");

        ar.forEach(m => {
            let s = /*html*/`<li class="${m.class}" data-route="${m.path}" title="${m.title}">
                <a href="${m.url}">
                    <span class="${m.menuIcon}"></span> <span class="name">${m.menuTitle}</span>
                </a>
            </li>`;
            ul.appendChild(DOM.parseHTML(s));
        })

        let nav = DOM.parseHTML(/*html*/`<nav class="main-menu"></nav>`)
        nav.appendChild(ul);

        return nav;
    }
}

export default PWA_RouterMenu;