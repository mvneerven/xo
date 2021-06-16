import ExoElementControl from "./ExoElementControl";
import DOM from "../../../pwa/DOM";

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
                `,
      },
      {
        name: "dropdown",
        type: Object,
        description: "A list of items that shows on hover",
      },

      {
        name: "class",
        type: String,
        description: "Class(es) to add on button element"
      }

    );
  }

  async render() {
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

    this.htmlElement.addEventListener("click", (e) => {
      if (this.click) {
        let data = this.context.exo.getFormValues();
        let f = this.click;
        if (typeof f !== "function") {
          f = this.context.exo.options.customMethods[f];
        }
        if (typeof f !== "function") {
          if (this.context.exo.options.host) {
            if (
              typeof this.context.exo.options.host[this.click] === "function"
            ) {
              f = this.context.exo.options.host[this.click];
              f.apply(this.context.exo.options.host, [data, e]);
              return;
            }
          } else {
            throw "Not a valid function: " + this.click;
          }
        }
        f.apply(this, [data, e]);
      } else if (this.action) {
        let actionParts = this.action.split(":");

        switch (actionParts[0]) {
          case "next":
            this.context.exo.addins.navigation.nextPage();
            break;
          case "reset":
            this.context.exo.addins.navigation.goto(1);
            break;

          case "goto":
            this.context.exo.addins.navigation.goto(parseInt(actionParts[1]));
            break;
        }
      }
    });

    if (this.dropdown && Array.isArray(this.dropdown)) {
      const btnClone = this.htmlElement.cloneNode(true);
      this.htmlElement = DOM.parseHTML(`<div class="exf-dropdown-cnt"></div>`);
      this.htmlElement.appendChild(btnClone);
      this.htmlElement.appendChild(await this.renderDropdown());
      this.container.textContent = "";
      this.container.appendChild(this.htmlElement);
    } else if (this.dropdown) {
      throw new Error("Invalid dropdown value: value must be an Array");
    }

    this.container.classList.add("exf-btn-cnt");
    return this.container;
  }

  set class(value){
    this._class = value;
    this.htmlElement.classList.add(...this._class.split(' '))
  }

  get class(){
    return _class;
  }

  async renderDropdown() {
    const listElement = DOM.parseHTML(`<ul class="exf-btn-dropdown" />`);
    for (const item of this.dropdown) {
      listElement.appendChild(await this.getListItem(item));
    }
    return listElement;
  }

  async getListItem(item) {
    let template = DOM.parseHTML("<li/>");
    switch (item.type) {
      case "event":
        template = DOM.parseHTML(
          DOM.format(
            `<li title="{{tooltip}}"><a class="{{class}}">{{name}}</a></li>`,
            item
          )
        );
        template.addEventListener("click", () => {
          const ev = new Event(item.title);
          this.container.dispatchEvent(ev);
        });
        break;
      case "field":
        template = DOM.parseHTML(
          DOM.format(
            `<li title="{{tooltip}}"><a class="{{class}}">{{name}}</a></li>`,
            item
          )
        );
        template.querySelector("a").appendChild(await xo.form.run(item.field));
        break;
      default:
        template = DOM.parseHTML(
          DOM.format(
            `<li title="{{tooltip}}"><a class="{{class}}" href="{{url}}">{{name}}</a></li>`,
            item
          )
        );
        break;
    }
    return template;
  }

  set icon(value) {
    this._icon = value;
  }

  get icon() {
    return this._icon;
  }
}

export default ExoButtonControl;
