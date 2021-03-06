import Core from "../../../pwa/Core";
import DOM from "../../../pwa/DOM";
import ExoDivControl from "../base/ExoDivControl";
import ExoListViewEditExtension from './ExoListViewEditExtension';

const SortingTypes = {
  UNSET: "unset",
  ASC: "asc",
  DESC: "desc",
};

const MODES = ["dynamic", "static"];

class ExoListViewControl extends ExoDivControl {
  _views = ["tiles", "grid"];
  _valid = false;  
  singleSelect = false;
  selectionDependencies = [];
  _properties = [];

  _mode = MODES[0];
  _controls = [
    {
      type: "search",
      name: "filter",
      placeholder: "Type to filter...",
      listener: "input",
      class: "exf-std-lbl exf-listview-flt",
      caption: "",
      value: ""
    },
    {
      type: "button",
      name: "view",
      icon: "ti-layout-grid3",
      caption: "",
      tooltip: "Switch view"
    },
    {
      type: "button",
      name: "toggle",
      icon: "ti-check-box",
      dropdown: [
        {
          name: `Select all`,
          icon: "ti-check-box",
          tooltip: "Select all",
          title: "select",
          type: "event",
        },
        {
          name: `Deselect all`,
          icon: "ti-layout-width-full",
          tooltip: "Deselect all",
          title: "deselect",
          type: "event",
        },
      ],
    },
  ];


  currentPage = 1;
  pageSize = undefined;
  currentItems = [];
  cssVariables = {};
  primaryKey = undefined;

  constructor() {
    super(...arguments);

    this._hasValue = true; 
    this.events = new Core.Events(this);

    this.acceptProperties(
      {
        name: "items",
        type: Object,
        description:
          "Object array, url to fetch, callback function, or promise to get the data from",
      },
      { name: "value" },
      { name: "required", type: Boolean },
      {
        name: "view",
        description: "Current view (tiles, grid)",
      },
      {
        name: "views",
        description: "Accepted views",
        type: Array,
      },
      {
        name: "pageSize",
        type: Number,
      },
      {
        name: "singleSelect",
        type: Boolean,
      },
      {
        name: "controls", 
      },
      {
        name: "mappings",
        description: "Mappings of data in certain views",
      },
      {
        name: "properties",
        description: "Field declarations",
      },
      {
        name: "contextMenu",
        type: Object,
      },
      {
        name: "mode",
        type: String,
        description: "Sets the listview mode. Modes: dynamic (default), static"
      },
      {
        name: "minimum",
        type: Number,
        description: "Minimum number of selected items",
      },
      {
        name: "listen",
        type: Object,
        description: "Event listeners",
      },
      {
        name: "noItemsFoundText",
        type: String,
        default: "No items found",
        description: "Text to show when items list is empty"
      },
      {
        name: "tilegrid",
        type: String,
        default: "vertical",
        description: "Flow direction within each tile"
      },
      {
        name: "checkboxes",
        type: Boolean,
        description: "Set to true to enable checkbox selection mode"
      },

      {
        name: "tilewidth",
        type: String,
        default: "140px",
        description: "Tile width, if applicable"
      },
      {
        name: "edit",
        type: Object,
        description: "Optional edit settings to create a master-detail listview"
      }
    );
  }

  get properties() {
    return this._properties;
  }

  set properties(value) {
    this._properties = value;
    this.setPrimaryKey();
    if (!this._mappings) {
      this.setDefaultMappings();
    }
  }

  set views(value) {
    if (Array.isArray(value)) this._views = value;
    else if (typeof value === "string") this._views = [value];
    else
      throw new TypeError(
        "The views property must be a string or an array of strings"
      );
  }

  get views() {
    return this._views;
  }

  get mode() {
    return this._mode
  }

  set mode(value) {
    if (MODES.includes(value))
      this._mode = value;
    else
      throw TypeError("Invalid mode")
  }

  setDefaultMappings() {
    this._mappings = {
      grid: [],
      tiles: [],
    };

    for (const i of this._properties) {
      this._mappings.tiles.push({
        key: i.key,
      });
      this._mappings.grid.push({
        key: i.key,
        autoWidth: true,
      });
    }
  }

  get mappings() {
    return this._mappings || {};
  }

  set mappings(value) {
    this._mappings = value;
  }

  set listen(obj) {
    this._listen = obj || {};
    for (var n in this._listen) {
      this.on(n, this._listen[n]);
    }
  }

  get listen() {
    return this._listen;
  }

  async render() {
    await super.render();

    this.trySetupEdit();
    this.setPrimaryKey();
    this.mapProperties();
    this.renderList();
    this.renderLoading();
    if (this.controls) await this.addControls();
    this.renderItems();

    this.container.classList.add("exf-listview");
    this.view =
      this.view && this.views.includes(this.view) ? this.view : this.views[0]; // set initial view - can be toggled using button bar
    this.container.setAttribute("data-view", this.view);
    this.container.classList.add(this.mode);

    if (this.required) {
      const validityInput = DOM.parseHTML(
        '<input id="validityInput" required>'
      );
      //validityInput.setCustomValidity(this.validationMessage);
      this.container.appendChild(validityInput);
    }

    this.on("finishAdd", async () => this.renderItems())
      .on("finishEdit", async () => this.renderItems())
      .on("finishDelete", async () => this.renderItems())
      .on("finishEnable", async () => this.renderItems())
      .on("finishDisable", async () => this.renderItems());

    this.container.classList.add("exf-std-lbl");

    this.container.classList.add(`exf-lv-tg-${this.tilegrid}`);

    return this.container;
  }

  trySetupEdit() {
    if (typeof (this.edit) === "object") {
      new ExoListViewEditExtension(this, this.edit)
    }
  }

  renderLoading() {
    const loadingGridDiv = DOM.parseHTML(/*html*/ `
      <div class="exf-lv-item loading-grid-item">
        <div class="loading-container">
          <div class="loading-container-bar"></div>
        </div>
        <div class="loading-content">
          Loading items
        </div>
      </div>
    `);
    this.listDiv.appendChild(loadingGridDiv);

    Array(3)
      .fill(true)
      .forEach(() => {
        const loadingTilesDiv = DOM.parseHTML(
          /*html*/ `<div class="exf-lv-item loading-tile"></div>`
        );
        this.listDiv.appendChild(loadingTilesDiv);
      });
  }

  async refresh() {
    await this.renderItems(true)
  }

  async renderItems(noFetch) {
    try {
      if (!noFetch) {
        this.tableItems = await Core.acquireState(this.items);
      }

      // apply current sorting
      let items = this.getSortedList();
      // apply search string
      items = this.filterListView(this.getSearchString(), items);

      if (this.pageSize && this.view !== "tiles") {
        const maxPages = Math.ceil(items.length / this.pageSize);
        if (this.currentPage > maxPages && maxPages > 0)
          this.currentPage = maxPages;
        const start = (this.currentPage - 1) * this.pageSize;
        this.currentItems = items.slice(start, start + this.pageSize);
        this.renderPagingButtons(items);
      } else {
        this.currentItems = items;
      }

      this.renderListContent(this.currentItems);
    } catch (e) {
      console.error("Failed to fetch items", this.items, e);
      this.listDiv
        .querySelectorAll(".exf-lv-item")
        .forEach((el) => el.remove());
      this.cssVariables["--lv-tile-template"] = "1fr";
      
      const failedDiv = DOM.parseHTML(/*html*/ `
        <div class="exf-lv-item empty">
          ??? Failed to fetch items
        </div>
      `);
      this.listDiv.appendChild(failedDiv);
    }
  }



  renderPagingButtons(items) {
    // delete current paging buttons from list div if found
    const currentButtons = this.listDiv.querySelector(".exf-lv-paging");
    if (currentButtons) {
      currentButtons.remove();
    }

    if (items.length) {
      const maxPages = Math.ceil(items.length / this.pageSize);
      const start = (this.currentPage - 1) * this.pageSize;
      const pagingTemplate = DOM.parseHTML(/*html*/ `<div class="exf-lv-paging">
        <p class="exf-text">
          Showing items ${start + 1}-${start + this.currentItems.length} of ${items.length
        }
        </p>
      </div>`);
      const buttonsTemplate = DOM.parseHTML(
        /*html*/ `<div class="exf-lv-paging__buttons"></div>`
      );
      pagingTemplate.appendChild(buttonsTemplate);
      const buttons = [
        {
          value: 1,
          template: '<span class="ti-angle-double-left"></span>',
          disabled: this.currentPage === 1,
        },
        {
          value: this.currentPage - 1,
          template: '<span class="ti-angle-left"></span>',
          disabled: this.currentPage === 1,
        },
        ...this.getPagingButtons(maxPages),
        {
          value: this.currentPage + 1,
          template: '<span class="ti-angle-right"></span>',
          disabled: this.currentPage === maxPages,
        },
        {
          value: maxPages,
          template: '<span class="ti-angle-double-right"></span>',
          disabled: this.currentPage === maxPages,
        },
      ];

      buttons.forEach((button) => {
        const btn = DOM.parseHTML(
          `<button type="button" class="exf-btn">${button.template}</button>`
        );
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();

          this.events.trigger("action", {
            id: "paging",
            value: button.value,
          });
        });
        if (button.active) btn.classList.add("current-page");
        if (button.disabled) btn.setAttribute("disabled", true);
        buttonsTemplate.appendChild(btn);
      });

      this.listDiv.appendChild(pagingTemplate);
    }
  }

  pagingButtonClickEvent(page) {
    this.currentPage = page;
    this.renderItems();
  }

  getPagingButtons(maxPages) {
    const buttons = [];
    if (this.currentPage !== 1 && this.currentPage < maxPages) {
      buttons.push(
        ...[this.currentPage - 1, this.currentPage, this.currentPage + 1]
      );
    } else {
      switch (maxPages) {
        case 1:
          buttons.push(1);
          break;
        case 2:
          buttons.push(...[1, 2]);
          break;
        default:
          if (this.currentPage === 1) buttons.push(...[1, 2, 3]);
          else buttons.push(...[maxPages - 2, maxPages - 1, maxPages]);
          break;
      }
    }

    return buttons.map((btn) => {
      return {
        value: btn,
        template: btn,
        active: btn === this.currentPage,
      };
    });
  }

  renderList() {
    // delete current list from container if found
    const currentList = this.container.querySelector(".exf-listview-list");
    if (currentList) {
      currentList.remove();
    }

    this.listDiv = this.createListDiv();

    if (this.mode === MODES[0]) {
      this.listDiv.addEventListener("click", (e) => {
        if (this.checkboxes && e.target.type !== "checkbox") {
          this.selectFirstDropdownAction(e)
          return;
        }

        e.stopPropagation();
        //e.returnValue = false;

        let art = e.target.closest("[data-id]")
        if (art) {
          let id = art.getAttribute("data-id");
          if (id) {
            let i = this.currentItems.find(i => {
              return i[this.primaryKey] === id
            })
            if (i) {
              if (this.singleSelect && i[this.primaryKey] === this.value) {
                if (!e.ctrlKey)
                  return;
              }
              this.selectItems(i);
            }
          }
        }
      });
    }

    this.listDiv.appendChild(DOM.parseHTML(this.getHeaders()));

    this.mappedProperties
      .filter((prop) => prop.grid && prop.grid.sort)
      .forEach((prop) => {
        const header = this.listDiv.querySelector(
          `.exf-lv-headers [data-property="${prop.key}"]`
        );
        header.dataset.sort = SortingTypes.UNSET;

        header.addEventListener("click", () => {
          this.listDiv
            .querySelectorAll(
              `.exf-lv-headers [data-sort]:not([data-property="${prop.key}"])`
            )
            .forEach((el) => {
              if (el.dataset.sort) el.dataset.sort = SortingTypes.UNSET;
            });
          header.dataset.sort = this.getSort(header.dataset.sort);

          this.renderItems(false);
        });
      });
  }

  setPrimaryKey() {
    this.primaryKey = undefined;
    const primaryProp = this.properties.find((p) => p.isPrimaryKey);
    if (primaryProp) this.primaryKey = primaryProp.key;
    else if (this.properties.length) {
      console.debug("No primary key in properties. Assuming first property");
      this.primaryKey = this.properties[0].key;
    }
  }

  // item click when using checkboxes for selection should 
  // trigger first action as defined in contextmenu
  selectFirstDropdownAction(e) {
    if (this.contextMenu?.itemList) {
      let act = e.target;
      let first = this.contextMenu.itemList[0];
      let itemId = act.closest("article")?.getAttribute("data-id");
      this.events.trigger("action", {
        id: first.action,
        items: [itemId],
      });
    }
  }

  mapProperties() {
    this.mappedProperties = [];

    this.views.reduce((a, b) => {
      const exists = Object.keys(this.mappings).includes(b);
      // log error when no mapping is available for certain view
      if (!exists) console.debug(`No mapping found for view "${b}"`);
      return exists ? a : false;
    }, true);

    this.properties.forEach((prop) => {
      let p = prop;
      if (this.mappings) {
        Object.keys(this.mappings).forEach((m) => {
          const mapping = this.mappings[m].find((map) => map.key === p.key);
          if (mapping) p[m] = mapping;
        });
      } else p.grid = {};
      this.mappedProperties.push(p);
    });


  }

  getMappingOrder() {
    const mappingOrders = {};

    Object.keys(this.mappings).forEach((mapping) => {
      mappingOrders[mapping] = this.mappings[mapping].map((m) => m.key);
    });
    return mappingOrders;
  }

  getSort(sort) {
    if (sort === SortingTypes.UNSET) return SortingTypes.ASC;
    return sort === SortingTypes.ASC ? SortingTypes.DESC : SortingTypes.UNSET;
  }

  async renderListContent(items) {
    this.listDiv.querySelectorAll(".exf-lv-item").forEach((el) => el.remove());

    if (!items.length) {
      return this.renderNoItemsFound();
    }

    this.cssVariables["--tile-width"] = this.tilewidth;// "100px";

    this.cssVariables["--lv-tile-template"] =
      "repeat(auto-fill, minmax(var(--tile-width, 140px), 1fr))";
    this.renderStyleSheet();

    for (const i of items) {
      const template = DOM.parseHTML(this.getTemplate(i));

      const pagingRow = this.listDiv.querySelector(".exf-lv-paging");
      if (pagingRow) this.listDiv.insertBefore(template, pagingRow);
      else this.listDiv.appendChild(template);
      const elm = this.listDiv.querySelector(
        `[data-id="${i[this.primaryKey]}"]`
      );
    }


    this.renderCheckboxes();

    // (re)select all ids inside value
    this.renderSelected();

    this.listDiv.addEventListener("mousemove", () => this.addOverflowBars());

    // create single contextmenu and move it to article hovered over
    if (this.contextMenu) {
      this.contextMenu.itemList = await Core.acquireState(this.contextMenu.items);
      let btn = await xo.form.run({
        type: "button",
        name: `context-actions`,
        icon: "ti-more-alt",
        ...this.contextMenu,
        dropdown: this.contextMenu.itemList,
      });
      btn.querySelector("button").classList.remove("exf-btn");
      btn.addEventListener("click", e => {
        e.stopPropagation();
        e.returnValue = false;
        // if clicked on element inside action dropdown, don't select
        if (e.target.closest(".exf-dropdown-cnt")) {
          let act = e.target.closest("[data-action]");
          if (act) {
            let itemId = act.closest("article").getAttribute("data-id");
            act = act.getAttribute("data-action");
            this.events.trigger("action", {
              id: act,
              items: [itemId],
            });
          }
        }
      });

      btn.addEventListener("beforeDropdown", (e) => {
        e.stopPropagation();

        const art = e.target.closest("article");
        const ev = new CustomEvent("beforeContextMenu", {
          bubbles: true,
          cancelable: true,
          detail: {
            ...e.detail,
            item: this.tableItems.find((i) => i.id === art.dataset.id),
            domItem: art,
          },
        });
        this.container.dispatchEvent(ev);

        if (
          !this.contextMenu.direction ||
          this.contextMenu.direction === "down"
        ) {
          const prevStyleSheet = document.getElementById(
            `dropdown-${this.context.field.id}`
          );
          if (prevStyleSheet) prevStyleSheet.remove();

          const ctxMenu = art.querySelector(".exf-dropdown-cnt");
          const rect = ctxMenu.getBoundingClientRect();

          const cssSheet = document.createElement("style");
          cssSheet.id = `dropdown-${this.context.field.id}`;
          cssSheet.innerHTML = `[data-id=${this.context.field.id
            }][data-view=grid] .exf-btn-dropdown {
            min-width: unset;
            position: fixed !important;
            top: ${rect.y + rect.height}px !important;
            right: ${document.body.clientWidth - rect.x - rect.width
            }px !important;
          }`;
          document.querySelector("head").appendChild(cssSheet);
        }
      });

      this.listDiv.appendChild(btn);
      btn.style.display = "none";


      if (this.mode === MODES[0]) {
        this.listDiv.addEventListener("mousemove", (e) => {
          let art = e.target.closest("article");
          if (art && this.hoveredArt === art) return;

          if (art) {
            this.hoveredArt = art;
            art.style.position = "relative";
            btn.style.position = "absolute";
            btn.style.right = "5px";
            btn.style.top = "-10px";
            btn.style.display = "block";

            art.appendChild(btn);
          }
        });
      }
    }

    this.events.trigger("ready");
  }

  renderCheckboxes() {
    if (this.checkboxes) {
      this.container.classList.add("exf-lv-check");
      this.listDiv.querySelectorAll(".exf-lv-item").forEach(item => {
        let checkBox = document.createElement("input");
        checkBox.type = "checkbox";
        checkBox.classList.add("exf-lv-chk")
        //checkBox.style = "position:absolute; left: -.5rem; top: .8rem"
        item.appendChild(checkBox);
      });
    }
  }

  selectItems(i, selectAll) {
    let v = this.value ? JSON.parse(JSON.stringify(this.value)) : undefined;
    if (!v && this.singleSelect) v = null;
    else if (!v && !this.singleSelect) v = [];

    if (i) {
      if (this.singleSelect) {
        v = v === i[this.primaryKey] ? null : i[this.primaryKey];
      } else if (v.includes(i[this.primaryKey])) {
        v.splice(v.indexOf(i[this.primaryKey]), 1);
      } else if (!v.includes(i[this.primaryKey])) {
        v.push(i[this.primaryKey]);
      }
    } else if (selectAll) {
      const selectingIds = this.currentItems
        .filter((ci) => !v.includes(ci[this.primaryKey]))
        .map((ci) => ci[this.primaryKey]);
      v.push(...selectingIds);
    } else {
      const deselectingIds = this.currentItems
        .filter((ci) => v.includes(ci[this.primaryKey]))
        .map((ci) => ci[this.primaryKey]);
      v = v.filter((val) => !deselectingIds.includes(val));
    }

    this.value = v;
  }

  renderSelected() {
    if (this.listDiv) {
      this.listDiv.querySelectorAll("article.exf-lv-item").forEach((art) => {

        let selected =
          (this.singleSelect && this.value && this.value === art.dataset.id) ||
          (!this.singleSelect && this.value && this.value.includes(art.dataset.id))

        this.selectItem(art, selected)

      });
    }
  }

  selectItem(item, selected) {
    if (this.checkboxes) {
      item.querySelector("input[type=checkbox]").checked = selected;
    }
    else {
      item.classList[selected ? "add" : "remove"]("selected");
    }
  }

  addOverflowBars() {
    this.container
      .querySelectorAll(".exf-lv-item__cell:not(.overflowing)")
      .forEach((e) => {
        if (e.scrollHeight > e.clientHeight) {
          e.classList.add("overflowing");
          let div = DOM.parseHTML(/*html*/ `<div class="overflow-bar"></div>`);
          e.appendChild(div);
        }
      });
  }

  createListDiv() {
    let div = DOM.parseHTML(/*html*/ `<div class="exf-listview-list"></div>`);
    this.htmlElement.appendChild(div);

    //TODO: adapt container height
    const setC = () => {
      let h = window.innerHeight - 250;
      div.parentElement.style.maxHeight = h + "px";
    };

    DOM.throttleResize(window, setC);

    return div;
  }

  // add button bar
  async addControls() {
    if (this.mode === MODES[1])
      return;

    this.selectionDependencies = []; // keep list of elements that depend on list selection

    const btns = document.createElement("div");
    btns.classList.add("exf-listview-btns", "exf-cnt");
    const controls = await Core.acquireState(this.controls);
    const filteredControls = controls.filter(
      (c) =>
        !Boolean(
          (this.singleSelect && c.name === "toggle") ||
          (this.views.length < 2 && c.name === "view")
        )
    );
    for (const c of filteredControls) {
      // render single controls
      await xo.form.run(c, {
        parentElement: btns
      }).then((e) => {
        btns.appendChild(e);

        if (c.useSelection) {
          this.selectionDependencies.push(e);
          DOM.disable(e);
        }

        let id = c.name;
        e.addEventListener(c.listener || "click", (ev) => {
          let act = ev.target.closest("[data-action]");
          if (act) {
            id = act.getAttribute("data-action");
          }

          ev.preventDefault();

          ev.stopPropagation();


          this.events.trigger("action", {
            id: id,
            value: ev.target.value || null,
          });

          ev.returnValue = false;
        });
      });
    }
    this.container.appendChild(btns);

    this.listenDOM();
  }

  // remove selected items
  deleteSelected(selected) {
    selected.forEach((id) => {
      const elm = this.container.querySelector(`article[data-id="${id}"]`);
      elm.classList.add("exf-hidden");
    });
  }

  getSelectedIds() {
    let ar = [];
    this.container
      .querySelectorAll(".exf-listview-list article.selected")
      .forEach((elm) => ar.push(elm.dataset.id));
    if (this.selectionDependencies.length) {
      let enable = ar.length > 0;
      this.selectionDependencies.forEach((elm) => {
        DOM[enable ? "enable" : "disable"](elm);
      });
    }
    return ar;
  }

  listenDOM() {
    this.on("action", (e) => {

      switch (e.detail.id) {
        case "del":
          const selected = this.value;
          this.deleteSelected(selected);
          this.events.trigger("delete", { data: selected });
          break;
        case "add":
          this.events.trigger("startAdd", { items: this.tableItems });
          break;
        case "view":
          this.toggleView();
          break;
        case "toggle":
          this.toggleSelection(true);
          break;
        case "select":
          this.selectItems(null, true);
          break;
        case "deselect":
          this.selectItems(null, false);
          break;
        case "filter":
          this.searchString = e.detail.value;
          this.renderItems(true);
          break;
        case "paging":
          this.pagingButtonClickEvent(e.detail.value);
          break;
        default:
          if (e.detail.id !== "action") {
            this.events.trigger(e.detail.id, {
              data: e.detail.items,
              items: this.tableItems,
            });
          }
          break;
      }
    });
  }

  filterListView(value, items) {
    const filteredItems = [];
    if (!items) items = this.tableItems;
    items.forEach((item) => {
      let content = "";


      this.properties.forEach((prop) => {
        const data = prop.dataCallback
          ? prop.dataCallback(prop.key, item[prop.key], item)
          : item[prop.key];
        if (["number", "string"].includes(typeof data)) {
          content += data;
        }

      });
      if (content.toLowerCase().includes(value.toLowerCase()) || !value) {
        filteredItems.push(item);
      }
    });
    return filteredItems;
  }

  renderNoItemsFound() {
    this.cssVariables["--lv-tile-template"] = "1fr";
    this.renderStyleSheet();
    const emptyDiv = DOM.parseHTML(/*html*/ `
      <div class="exf-lv-item empty">
        ${this.noItemsFoundText}
      </div>
    `);

    const pagingRow = this.listDiv.querySelector(".exf-lv-paging");
    if (pagingRow) this.listDiv.insertBefore(emptyDiv, pagingRow);
    else this.listDiv.appendChild(emptyDiv);
  }

  toggleSelection() {
    this.currentItems.forEach((ci) => {
      const item = this.listDiv.querySelector(
        `article.exf-lv-item[data-id="${ci[this.primaryKey]}"]`
      );

      item.classList.toggle("selected");
    });

    this.value = this.getSelectedIds();
  }

  // toggles between the available views
  toggleView() {
    let viewIndex = this.views.indexOf(this.view) + 1;
    if (viewIndex >= this.views.length) viewIndex = 0;

    this.view = this.views[viewIndex];
    this.renderItems(true);
    this.container.setAttribute("data-view", this.view);
  }

  get controls() {
    return this._controls;
  }

  set controls(value) {
    this._controls = value;
  }

  // should set the selected items
  set value(data) {

    if (this._value == undefined || data !== this._value ||
      (Array.isArray(data) &&
        Array.isArray(this._value) &&
        JSON.stringify(data.sort()) !== JSON.stringify(this._value.sort()))) {

      this._value = data;

      
      if (this.rendered) {

        const evData = this.singleSelect ? { item: data } : { items: data };
        this.events.trigger("change", evData);

        if (this.container) {
          const ev = new CustomEvent("change", {
            bubbles: true,
            cancelable: true,
            detail: {
              ...evData
            },
          });
          this.htmlElement.dispatchEvent(ev);
        }
      }
    }
    else {
      return;
    }

    if (this.rendered) {
      if (this.selectionDependencies.length) {
        let enable = data.length > 0;
        this.selectionDependencies.forEach((elm) => {
          DOM[enable ? "enable" : "disable"](elm);
        });
      }
      this.renderSelected();
    }
  }

  // should return an array of selected ids
  get value() {
    return this._value;
  }

  // See constructor: acceptProperties
  set items(data) {
    this._items = data;
  }

  // See constructor: acceptProperties
  get items() {
    return this._items;
  }

  getHeaders() {
    let columnHeaders = "";
    this.mappedProperties.forEach((prop) => {
      const name = prop.name || "";

      if (prop.grid) {
        if (!name) console.warn(`No name specified for column "${prop.key}"`);

        columnHeaders += /*html*/ `<div class="exf-lv-headers__header ${prop.class || ""
          }" data-property="${prop.key}" style="grid-area: ${prop.key
          };">${name}</div>`;
      }
    });

    this.setColumnGrid();

    return /*html*/ `<div class="exf-lv-headers">
        ${columnHeaders}
    </div>`;
  }

  getTemplate(item) {
    let columnHtml = "";
    let i = 0;
    this.properties.forEach((prop) => {
      columnHtml += this.getGridDiv(item, prop, i);
      i++;
    });
    return /*html*/ `<article data-id="${item[this.primaryKey]
      }" class="exf-lv-item">
        ${columnHtml}
    </article>`;
  }

  getSortedList() {
    const header = this.container.querySelector(
      ".exf-lv-headers [data-sort]:not([data-sort=unset])"
    );
    if (header)
      return this.sortData(header.dataset.property, header.dataset.sort);
    else return this.tableItems;
  }

  sortData(propKey, sort) {
    let sortedList = [];
    const items = JSON.parse(JSON.stringify(this.tableItems));
    const property = this.mappedProperties.find((p) => p.key === propKey);
    const dataCallback = property.dataCallback || this.returnValue;
    if (sort === SortingTypes.UNSET) sortedList = items;
    else {
      sortedList = items.sort((a, b) =>
        dataCallback(propKey, a[propKey], a) >=
          dataCallback(propKey, b[propKey], b)
          ? 1
          : -1
      );
    }
    if (sort === SortingTypes.DESC) sortedList.reverse();
    return sortedList;
  }

  returnValue(key, val, item) {
    return val;
  }

  getGridDiv(item, prop) {
    let cellData = prop.dataCallback
      ? prop.dataCallback(prop.key, item[prop.key], item)
      : prop.format ? item[prop.key][prop.format] : item[prop.key]; //item[prop.key]; 

    if (this.isElement(cellData)) {
      const el = document.createElement("div");
      el.appendChild(cellData);
      cellData = el.innerHTML;
    }

    switch (prop.type) {
      case "img":
        cellData = `<div class="exf-lv-item__cell__content__img" style="background-image: url(${cellData})"></div>`;
        break
      case "currency":
        cellData = `${Core.formatValue(cellData, {
          type: "currency",
          country: prop.countryCode || window.navigator.userLanguage || window.navigator.language,
          currencyCode: prop.currency || "EUR"
        })}`;
    }

    const classes = ["exf-lv-item__cell"];
    if (prop.class) classes.push(prop.class);
    if (!prop.grid) classes.push("hide-in-grid");
    if (!prop.tiles) classes.push("hide-in-tile");

    const mappingOrders = this.getMappingOrder();
    if (mappingOrders.grid && mappingOrders.grid.indexOf(prop.key) === 0)
      classes.push("first-of-grid");
    if (
      mappingOrders.grid &&
      mappingOrders.grid.indexOf(prop.key) === mappingOrders.grid.length - 1
    )
      classes.push("last-of-grid");

    const cellTemplate = `<div class="${classes.join(" ")}" style="grid-area: ${prop.key
      }; ${prop.style || ""}" data-property="${prop.key}">
        <div class="exf-lv-item__cell__content">{{content}}</div>
    </div>`;

    if (prop.grid?.filterInPlace) {
      const base = prop.grid.searchURL || `${location.href}/`;
      const url = `${base}${cellData}`;
      cellData = `<a href="${url}">${cellData}</a>`;
    }

    return DOM.format(cellTemplate, { content: cellData });
  }

  isElement(element) {
    return element instanceof Element || element instanceof HTMLDocument;
  }

  setColumnGrid() {
    const sizes = ["xxs", "xs", "sm", "md", "lg", "xl"];
    const gridTemplate = {};
    sizes.forEach((s) => (gridTemplate[s] = { columns: [], areas: [] }));
    const mappingOrders = this.getMappingOrder();
    const tileTemplate = mappingOrders.tiles
      ? new Array(mappingOrders.tiles.length).fill(true)
      : [];
    const tileTemplateAreas = mappingOrders.tiles
      ? new Array(mappingOrders.tiles.length).fill(true)
      : [];
    this.mappedProperties.forEach((prop) => {
      if (prop.grid) {
        const width =
          !prop.grid.width ||
            prop.grid.width.trim() === "100%" ||
            prop.grid.autoWidth
            ? "1fr"
            : prop.grid.width.trim();
        const applicableSizes = ["xl"];
        if (prop.class) {
          const classes = prop.class.split(" ");
          if (classes.includes("hide-md")) applicableSizes.push("lg");
          else if (classes.includes("hide-sm"))
            applicableSizes.push(...["md", "lg"]);
          else if (classes.includes("hide-xs"))
            applicableSizes.push(...["sm", "md", "lg"]);
          else if (classes.includes("hide-xxs"))
            applicableSizes.push(...["xs", "sm", "md", "lg"]);
          else applicableSizes.push(...["xs", "sm", "md", "lg"]);
        } else applicableSizes.push(...["xxs", "xs", "sm", "md", "lg"]);

        applicableSizes.forEach((as) => {
          gridTemplate[as].columns.push(width);
          gridTemplate[as].areas.push(prop.key);
        });
      }

      if (prop.tiles) {
        // get size dependant on tile flow (vert or hor)
        let size = prop.tiles.size || (this.tilegrid === "horizontal" ? prop.tiles.width : prop.tiles.height);
        let autoSize = prop.tiles.autoSize || (this.tilegrid === "horizontal" ? prop.tiles.autoWidth : prop.tiles.autoHeight);

        tileTemplate[mappingOrders.tiles.indexOf(prop.key)] =
          !size ||
            size.trim() === "100%" ||
            autoSize
            ? "1fr"
            : size.trim();
        tileTemplateAreas[
          mappingOrders.tiles.indexOf(prop.key)
        ] = `'${prop.key}'`;
      }
    });

    if (mappingOrders.grid) {
      Object.keys(gridTemplate).forEach((size) => {
        gridTemplate[size].columns.sort((a, b) => {
          const areaA =
            gridTemplate[size].areas[gridTemplate[size].columns.indexOf(a)];
          const areaB =
            gridTemplate[size].areas[gridTemplate[size].columns.indexOf(b)];
          return mappingOrders.grid.indexOf(areaA) >
            mappingOrders.grid.indexOf(areaB)
            ? 1
            : -1;
        });
        gridTemplate[size].areas.sort((a, b) =>
          mappingOrders.grid.indexOf(a) > mappingOrders.grid.indexOf(b) ? 1 : -1
        );

        this.cssVariables[`--lv-grid-template-${size}`] =
          gridTemplate[size].columns.join(" ");
        this.cssVariables[
          `--lv-grid-template-${size}-areas`
        ] = `'${gridTemplate[size].areas.join(" ")}'`;
      });
    }

    // set css variables for list view grid templates
    this.cssVariables["--lv-tile-template"] =
      "repeat(auto-fill, minmax(200px, 1fr))";

    this.cssVariables["--lv-tile-content-template"] = tileTemplate.join(" ");

    this.cssVariables["--lv-tile-content-template-areas"] =
      tileTemplateAreas.join(" ");

    this.renderStyleSheet();
  }

  getSearchString() {
    let searchString = "";
    const filterField = this.container.querySelector(".exf-listview-flt input");
    if (this.searchString) searchString = this.searchString;
    else if (filterField && filterField.value) searchString = filterField.value;
    return searchString;
  }

  get validationMessage() {
    if (!this.valid) {

      if (this.singleSelect) {
        return `This field is required`;
      }


      return `Select at least ${this.minimum} item(s)`;
    }
  }

  // set valid(valid) {
  //   this._valid = this.required ? valid : true;
  // }

  get valid() {
    if (!this.required) {
      return true;
    }

    if (this.singleSelect) {
      return this.value != null && this.value != ""
    }

    this.minimum = this.minimum || 1;

    return (Array.isArray(this.value) && this.value.length >= this.minimum) ||
      (this.value && this.minimum <= 1);
  }
}

export default ExoListViewControl;
