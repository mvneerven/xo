import ExoElementControl from "./ExoElementControl";
import DOM from "../../../pwa/DOM";
import ExoFormFactory from "../../core/ExoFormFactory";

class ExoButtonControl extends ExoElementControl {

  clickCount = 0;

  constructor(context) {
    super(context);

    this._useContainer = false; // no container by default


    this.iconHtml = "";

    this.htmlElement = DOM.parseHTML('<button type="button" class="exf-btn" />');

    // if no binding is set up, add one to make clicking the button change a value in the model
    // for conditionless RuleEngine actions to fire then.
    if (!context.field.bind) {
      if (context.exo.dataBinding) {
        context.exo.dataBinding.setupDefaultButtonBinding(this)
      }
    }

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
        description: `DEPRECATED - use generic actions array - Search for Rules Engine.
    Possible values: 
      - 'next' (next page in Wizard)
      - 'reset' (back to first page)
      - 'goto:[page]' (jump to given page)
      - dialog:[dialogname]
  `,
      },
      {
        name: "dropdown",
        type: Object | Array,
        description: "A list of items that shows on hover, or an object with an items array and optionally 'direction' and 'dropEvent' properties",
      },

      {
        name: "class",
        type: String,
        description: "Class(es) to add on button element",
      },

      {
        name: "outerClass",
        type: String,
        description: "Class(es) to add on container element",
      }
    );
  }

  async render() {
    let me = this;
    await super.render();

    if (this.icon) {
      this.htmlElement.appendChild(
        DOM.parseHTML(/*html*/`<span class="${this.icon}"></span>`)
      );
      this.htmlElement.appendChild(document.createTextNode(" "));
    }

    if (this.caption) {
      this.htmlElement.appendChild(
        DOM.parseHTML(/*html*/`<span class="exf-caption">${this.caption}</span>`)
      );
    } else {
      this.htmlElement.classList.add("exf-btn-compact");
    }

    this.htmlElement.addEventListener("click", this.handleClick.bind(this));

    if (this.dropdown) {
      this.dropdownExtension = await ExoFormFactory.createDropDown(this);
    }

    this.container.classList.add("exf-btn-cnt");

    if (this._outerClass)
      this.outerClass = this._outerClass;

    return this.container;
  }

  handleClick(e) {
    e.preventDefault();

    const me = this;
    me.clickCount++;
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

      let exo = me.context.exo; // xo.form.from(e.target.closest("form")); // this.context.exo;
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
        case "hide":
          let fld = exo.get(actionParts[1]);
          fld._control.container.style.display = 'none';
          break;
        case "show":
          let fld1 = exo.get(actionParts[1]);
          fld1._control.container.style.display = 'initial';
          break;
        case "toggle":
          let fld2 = exo.get(actionParts[1]);
          fld2._control.container.style.display = fld2._control.container.style.display === 'none' ? 'initial' : 'none';
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
      const dv = this.context.field.defaultValue;
      if (dv && this.value !== dv) {

        if (dv === -1) {
          this.value = this.clickCount;
        }
        else {
          this.value = dv;
        }
        var evt = new Event("change", { bubbles: true, cancelable: true })
        this.htmlElement.dispatchEvent(evt);
      }
    }
  }

  /**
  * @deprecated Use generic actions array - Search for Rules Engine.
  * Set action to execute on click.
  */
  set action(value) {
    this._action = value;
  }

  get action() {
    return this._action;
  }

  set class(value) {
    this._class = value;
    this.htmlElement.classList.add(...this._class.split(" "));
  }

  get class() {
    return _class;
  }

  set outerClass(value) {
    this._outerClass = value;
    if (this.rendered)
      this.container.classList.add(...this._outerClass.split(" "));
  }

  get outerClass() {
    return _outerClass;
  }

  set icon(value) {
    this._icon = value;
  }

  get icon() {
    return this._icon;
  }
}

export default ExoButtonControl;
