import Core from "../../../pwa/Core";
import DOM from "../../../pwa/DOM";
import ExoListControl from "../base/ExoListControl";

class ExoDropDownButton extends ExoListControl {
  icon = "ti-user";

  constructor(context) {
    super(context);
    
    this.events = new Core.Events(this);

    this.acceptProperties(
      {
        name: "icon",
        type: String,
      },
      {
        name: "items",
        type: Array,
      }
    );
  }

  async render() {
    console.warn("DEPRECATED: use button with 'dropdown' property instead of dropdownbutton")
    this.htmlElement = DOM.parseHTML(this.getNavTemplate());
    await super.render();
    const tpl = /*html*/ `<li title="{{tooltip}}"><a>{{name}}</a></li>`;
    this.items = await this.getItems();
    await this.populateList(
      this.htmlElement.querySelector("ul > li > ul"),
      tpl
    );
    return this.container;
  }

  async populateList(containerElm, tpl) {
    if (this.items && Array.isArray(this.items)) {
      this.items.forEach((i, index) => {
        this.addListItem(this.context.field, i, tpl, containerElm, index);
      });
    }
  }

  async addListItem(f, i, tpl, containerElm, index) {
    const item = {
      ...i,
      name: typeof i.name === "string" ? i.name : i,
      value: i.value !== undefined ? i.value : i,
      type: i.type || "link",
      inputname: f.name,
      tooltip: (i.tooltip || i.name || "").replace("{{field}}", ""),
      oid: f.id + "_" + index,
      url: i.url || "",
      title: i.title || "",
    };

    let template = DOM.parseHTML(`<div/>`);
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
    containerElm.appendChild(template);
  }

  async getItems() {
    return new Promise((resolve) => {
      if (Core.isUrl(this.items)) {
        fetch(this.items).then((x) => {
          if (x.status === 200) {
            resolve(x.json());
            return;
          }
          throw Error(`HTTP error ${x.status} - ${this.items}`);
        });
      } else if (Array.isArray(this.items)) {
        resolve(
          this.items.map((i) => {
            if (typeof i === "string") {
              return { text: i };
            }
            return i;
          })
        );
      } else if (typeof this.items === "function") {
        resolve(this.items);
      } else {
        return resolve(Promise.resolve(this.items));
      }
    });
  }

  getNavTemplate() {
    return `<nav class="ul-drop" role='navigation'>
        <ul>
            <li>
                <a class="user-icon" href="#"><span class="${this.icon}"></span></a>
                <ul></ul>
            </li>
        </ul>
    </nav>`;
  }

  setupButton() {
    document.querySelector("body").classList.add("signed-out");
    container.appendChild(
      DOM.parseHTML(DOM.format(tpl, data, { empty: undefined }))
    );
  }
}

export default ExoDropDownButton;
