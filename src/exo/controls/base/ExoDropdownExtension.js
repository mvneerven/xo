import DOM from "../../../pwa/DOM";
import Core from "../../../pwa/Core";

class ExoDropdownExtension {
    constructor(control) {
        this.control = control;
        this.events = new Core.Events(this);
    }

    async init(){
        const ctl = this.control;

        const btnClone = ctl.htmlElement.cloneNode(true);
        ctl.htmlElement = DOM.parseHTML(`<div class="exf-dropdown-cnt drop-dir-${ctl.direction || "down"}"></div>`);
        ctl.htmlElement.appendChild(btnClone);
        btnClone.addEventListener("click", e => {
            e.preventDefault();
        })

        const state = await Core.acquireState(ctl.dropdown, {
            process: (data, options)=>{
                if(typeof(data) === "object" && Array.isArray(data.items)){
                    ctl.direction = data.direction || ctl.direction;
                    ctl.dropEvent = data.event || ctl.dropEvent
                    return data.items;
                }
                
                return data;
            }
        })

        ctl.htmlElement.appendChild(await this.renderDropdown(state));
        ctl.container.textContent = "";
        ctl.container.appendChild(ctl.htmlElement);
    }

    get dropdownEvent(){
        return this.control.dropEvent === "mouse" ? "mouseenter" : "click"
    }

    async renderDropdown(items) {

        const listElement = DOM.parseHTML(`<ul class="exf-btn-dropdown ${this.control.direction || "left"}" />`);
        for (const item of items) {
          listElement.appendChild(await this.getListItem(item));
        } 
    
        this.control.htmlElement.addEventListener(this.dropdownEvent, e => {
          const ev = new CustomEvent("beforeDropdown",
            {
              bubbles: true,
              cancelable: true,
              detail: {
                dropdownItems: e.target.querySelectorAll(".exf-btn-dropdown li"),
                buttonControl: this
              }
            });
    
            this.control.htmlElement.dispatchEvent(ev);
    
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

      handleClick(e){
          this.events.trigger("click")
      }
}

export default ExoDropdownExtension;