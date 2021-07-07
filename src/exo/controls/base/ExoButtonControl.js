import ExoElementControl from "./ExoElementControl";
import DOM from "../../../pwa/DOM";
import Core from "../../../pwa/Core";

/**
 * Renders a button
 */
class ExoButtonControl extends ExoElementControl {
  constructor(context) {
    super(context);

    this._useContainer = false; // no container by default

    this.iconHtml = "";

    this.htmlElement = DOM.parseHTML('<button class="exf-btn" />');

    this.acceptProperties(
      {
        name: "icon",
        description: "Icon class to be used (using a span)",
      },
      {
        name: "click",
        description: "Click method",
      },
      {
        name: "action",
        description: `Possible values: 
                    - 'next' (next page in Wizard)
                    - 'reset' (back to first page)
                    - 'goto:[page]' (jump to given page)
                    - dialog:[dialogname]
                `,
      },
      {
        name: "dropdown",
        type: Object | Array,
        description: "A list of items that shows on hover",
      },

      {
        name: "direction",
        type: "string",
        description: "Optional direction form dropdown. Options: 'down' (default), 'left'"
      },

      {
        name: "class",
        type: String,
        description: "Class(es) to add on button element",
      }
    );
  }

  async render() {
    let me = this;
    await super.render();

    if (this.icon) {
      this.htmlElement.appendChild(
        DOM.parseHTML('<span class="' + this.icon + '"></span>')
      );
      this.htmlElement.appendChild(document.createTextNode(" "));
    }

    if (this.caption) {
      this.htmlElement.appendChild(
        DOM.parseHTML(`<span class="exf-caption">${this.caption}</span>`)
      );
    } else {
      this.htmlElement.classList.add("exf-btn-compact");
    }

    this.htmlElement.addEventListener("click", this.handleClick.bind(this));

    if (this.dropdown) {
      const btnClone = this.htmlElement.cloneNode(true);
      this.htmlElement = DOM.parseHTML(`<div class="exf-dropdown-cnt drop-dir-${this.direction || "down"}"></div>`);
      this.htmlElement.appendChild(btnClone);
      this.htmlElement.appendChild(await this.renderDropdown(await this.getData(this.dropdown)));
      this.container.textContent = "";
      this.container.appendChild(this.htmlElement);
    }

    this.container.classList.add("exf-btn-cnt");
    //this.htmlElement.classList.add("exf-btn");
    return this.container;
  }

  handleClick(e) {
    const me = this;
    let givenAction = this.action, isDropDown = false;

    if (e.target.closest(".exf-btn-dropdown")) {
      let itm = e.target.closest("[data-action]");
      if (itm) {
        isDropDown = true;
        givenAction = itm.getAttribute("data-action");
      }
    }
    if (me.click) {
      let ev = new CustomEvent("click", {
        detail: {
          origEvent: e,
          isDropDown: isDropDown,
          button: me
        }
      })
      me.click.apply(me, [ev]);

    } else if (givenAction) {

      let exo = xo.form.from(e.target.closest("form")); // this.context.exo;
      let actionParts = givenAction.split(":"); givenAction = actionParts[0];

      switch (givenAction) {
        case "next":
          exo.addins.navigation.next();
          break;
        case "back":
          exo.addins.navigation.back();
          break;
        case "reset":
          exo.addins.navigation.goto(1);
          break;
        case "goto":
          exo.addins.navigation.goto(parseInt(actionParts[1]));
          break;
        case "dialog":

          let dname = actionParts[1];
          let f = exo.get(dname);
          if (f) {
            f._control.show()
          }
          break;

        default:

          actionParts.shift()
          this.context.exo.events.trigger("action", {
            invoker: this,
            isDropDown: isDropDown,
            action: givenAction,
            parts: actionParts
          })
      }

    }

    else {
      this.value = this.context.field.defaultValue;
      var evt = document.createEvent("HTMLEvents");
      evt.initEvent("change", true, true);
      this.htmlElement.dispatchEvent(evt);
    }
  }

  set class(value) {
    this._class = value;
    this.htmlElement.classList.add(...this._class.split(" "));
  }

  get class() {
    return _class;
  }

  async renderDropdown(items) {

    const listElement = DOM.parseHTML(`<ul class="exf-btn-dropdown ${this.direction || "left"}" />`);
    for (const item of items) {
      listElement.appendChild(await this.getListItem(item));
    }

    this.htmlElement.addEventListener("mouseenter", e => {
      const ev = new CustomEvent("beforeDropdown",
        {
          bubbles: true,
          cancelable: true,
          detail: {
            dropdownItems: e.target.querySelectorAll(".exf-btn-dropdown li"),
            buttonControl:  this
          }
        });
      
      this.htmlElement.dispatchEvent(ev);

    });
    return listElement;

  }

  async getListItem(item) {
    let template = document.createElement("li");
    let icon = `<span class="${item.icon}"></span>`;

    if (typeof (item.click) === "function") {
      item.type = "click";
    }
    item.type = item.action ? "action" : item.type || "action";
    let caption = item.caption || item.name || "";
    let cls = item.class || "";

    switch (item.type) {

      case "click":
        template = DOM.parseHTML(
          `<li class="${cls}" title="${item.tooltip || ""}"><a>${icon} ${caption}</a></li>`,
        );
        template.addEventListener("click", item.click)
        break;

      case "action":
        template = DOM.parseHTML(
          `<li class="${cls}" data-action="${item.action}" title="${item.tooltip || ""}"><a>${icon} ${caption}</a></li>`,
        );
        template.addEventListener("click", this.handleClick.bind(this))
        break;

      case "event":
        template = DOM.parseHTML(
          `<li class="${cls}" data-action="${item.title}" title="${item.tooltip || ""}"><a>${icon} ${caption}</a></li>`,
        );
        break;
      case "field":
        template = DOM.parseHTML(
          `<li class="${cls}" title="${item.tooltip}}"><a>${icon} ${caption}</a></li>`,
        );
        template.querySelector("a").appendChild(await xo.form.run(item.field));
        break;
      default:
        template = DOM.parseHTML(
          `<li class="${cls}" title="${item.tooltip}"><a href="${item.url}">${icon} ${caption}</a></li>`,
        );
        break;
    }
    return template;
  }

  async getData(data, options) {
    return new Promise((resolve) => {
      if (Core.isUrl(data)) {
        fetch(data).then((x) => {
          if (x.status === 200) {
            resolve(x.json());
            return;
          }
          throw new Error(`HTTP error ${x.status} - ${data}`);
        });
      } else if (Array.isArray(data)) {
        resolve(data);
      } else if (typeof data === "function") {
        resolve(data(options || {}));
      } else {
        return resolve(Promise.resolve(data));
      }
    });
  }

  set icon(value) {
    this._icon = value;
  }

  get icon() {
    return this._icon;
  }
}

export default ExoButtonControl;
