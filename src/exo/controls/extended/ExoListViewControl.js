import Core from "../../../pwa/Core";
import DOM from "../../../pwa/DOM";
import ExoDivControl from "../base/ExoDivControl";

const SortingTypes = {
  UNSET: "unset",
  ASC: "asc",
  DESC: "desc",
};

class ExoListViewControl extends ExoDivControl {
  views = ["tiles", "grid"];
  view = "tiles";
  tileColumns = ["imageUri", "name", "description"];

  _columns = [];

  _controls = [
    {
      type: "button",
      name: "view",
      icon: "ti-layout-grid3",
      caption: "",
      tooltip: "Switch view",
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

  constructor() {
    super(...arguments);

    this.events = new Core.Events(this);

    this.acceptProperties(
      {
        name: "value", // current selection (array of ids)
      },
      {
        name: "required",
        type: Boolean,
      },
      {
        name: "items",
        type: Object,
        description:
          "Object array, url to fetch, callback function, or promise to get the data from",
      },
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
        name: "controls", // default _controls now used
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
        type: Array | Function,
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
      }
    );
  }

  set columns(value) {
    this._columns = value;
  }

  get columns() {
    return this._columns;
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

    this.mapProperties();
    this.renderList();
    this.renderLoading();
    if (this.controls) await this.addControls();
    this.renderItems();

    this.container.classList.add("exf-listview");
    this.view =
      this.view && this.views.includes(this.view) ? this.view : this.views[0]; // set initial view - can be toggled using button bar
    this.container.setAttribute("data-view", this.view);

    if (this.required) {
      const validityInput = DOM.parseHTML(
        '<input id="validityInput" required>'
      );
      validityInput.setCustomValidity(this.validationMessage);
      this.container.appendChild(validityInput);
    }

    this.on("finishAdd", async () => this.renderItems())
      .on("finishEdit", async () => this.renderItems())
      .on("finishDelete", async () => this.renderItems())
      .on("finishEnable", async () => this.renderItems())
      .on("finishDisable", async () => this.renderItems());

    return this.container;
  }

  renderStyleSheet() {
    const prevStyleSheet = document.getElementById(
      `variables-${this.context.field.id}`
    );
    if (prevStyleSheet) prevStyleSheet.remove();

    const cssSheet = document.createElement("style");
    cssSheet.id = `variables-${this.context.field.id}`;
    const css = Object.keys(this.cssVariables).map(
      (c) => `${c}: ${this.cssVariables[c]};`
    );
    cssSheet.innerHTML = `[data-id=${this.context.field.id}] { ${css.join(
      " "
    )} }`;
    document.querySelector("head").appendChild(cssSheet);
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

  async renderItems(noFetch) {
    try {
      if (!noFetch) {
        this.tableItems = await this.getData(this.items);
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
      this.listDiv
        .querySelectorAll(".exf-lv-item")
        .forEach((el) => el.remove());
      this.cssVariables["--lv-tile-template"] = "1fr";
      this.renderStyleSheet();
      const failedDiv = DOM.parseHTML(/*html*/ `
        <div class="exf-lv-item empty">
          ⚠ Failed to fetch items
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
          Showing items ${start + 1}-${start + this.currentItems.length} of ${
        items.length
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
          `<button class="exf-btn">${button.template}</button>`
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

  mapProperties() {
    this.mappedProperties = [];

    this.views.reduce((a, b) => {
      const exists = Object.keys(this.mappings).includes(b);
      // log error when no mapping is available for certain view
      if (!exists) console.error(`No mapping found for view "${b}"`);
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

    this.cssVariables["--lv-tile-template"] =
      "repeat(auto-fill, minmax(200px, 1fr))";
    this.renderStyleSheet();

    for (const i of items) {
      const template = DOM.parseHTML(this.getTemplate(i));

      const pagingRow = this.listDiv.querySelector(".exf-lv-paging");
      if (pagingRow) this.listDiv.insertBefore(template, pagingRow);
      else this.listDiv.appendChild(template);
      const elm = this.listDiv.querySelector(`[data-id="${i.id}"]`);
      elm.addEventListener("click", (e) => {
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

          e.stopPropagation();
          e.returnValue = false;
          return;
        }

        this.selectItem(elm, i);
      });
    }

    // (re)select all ids inside value
    this.setSelectedItems(this.value);

    document.addEventListener("mousemove", () => this.addOverflowBars());

    // create single contextmenu and move it to article hovered over
    if (this.contextMenu) {
      const am = await this.getData(this.contextMenu);
      let btn = await xo.form.run({
        type: "button",
        name: `context-actions`,
        icon: "ti-menu",
        direction: "left",
        dropdown: am,
      });
      this.listDiv.appendChild(btn);
      btn.style.display = "none";
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

    this.events.trigger("ready");
  }

  selectItem(elm, i) {
    const v = this.value ? JSON.parse(JSON.stringify(this.value)) : [];
    if (v.includes(i.id)) {
      elm.classList.remove("selected");
      v.splice(v.indexOf(i.id), 1);
    } else {
      elm.classList.add("selected");
      v.push(i.id);
    }

    this.value = v;
  }

  setSelectedItems(items) {
    if (items && items.length) {
      items.forEach((id) => {
        const elm = this.listDiv.querySelector(`article[data-id="${id}"]`);

        if (elm) {
          elm.classList.add("selected");
        }
      });
    }
  }

  addOverflowBars() {
    this.container
      .querySelectorAll(
        ".exf-lv-item__cell:not(.overflowing)"
      )
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
    this.selectionDependencies = []; // keep list of elements that depend on list selection

    const btns = document.createElement("div");
    btns.classList.add("exf-listview-btns", "exf-cnt");
    const controls = await this.getData(this.controls);
    for (const c of controls) {
      // render single controls
      await xo.form.run(c).then((e) => {
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
          this.selectAll(true);
          break;
        case "deselect":
          this.selectAll(false);
          break;
        case "filter":
          this.searchString = e.detail.value;
          this.renderItems(true);
          break;
        case "paging":
          this.pagingButtonClickEvent(e.detail.value);
          break;
        default:
          this.events.trigger(e.detail.id, {
            data: e.detail.items,
            items: this.tableItems,
          });
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
        No items found
      </div>
    `);

    const pagingRow = this.listDiv.querySelector(".exf-lv-paging");
    if (pagingRow) this.listDiv.insertBefore(emptyDiv, pagingRow);
    else this.listDiv.appendChild(emptyDiv);
  }

  selectAll(select) {
    const v = this.value ? JSON.parse(JSON.stringify(this.value)) : [];
    this.currentItems.forEach((ci) => {
      const item = this.listDiv.querySelector(
        `article.exf-lv-item[data-id="${ci.id}"]`
      );
      if (v.includes(ci.id) && !select) {
        item.classList.remove("selected");
        v.splice(v.indexOf(ci.id), 1);
      } else if (!v.includes(ci.id) && select) {
        item.classList.add("selected");
        v.push(ci.id);
      }
    });

    this.value = v;
  }

  toggleSelection() {
    this.currentItems.forEach((ci) => {
      const item = this.listDiv.querySelector(
        `article.exf-lv-item[data-id="${ci.id}"]`
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

  // updates the array of items to display
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

  // should set the selected items
  set value(data) {
    if (
      !this.value ||
      JSON.stringify(data.sort()) != JSON.stringify(this.value.sort())
    ) {
      this.events.trigger("change", {
        items: data,
      });
    }

    if (this.selectionDependencies.length) {
      let enable = data.length > 0;
      this.selectionDependencies.forEach((elm) => {
        DOM[enable ? "enable" : "disable"](elm);
      });
    }

    this._value = data;
    this.valid = data.length >= this.minimum;
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
      if (!name) console.warn(`No name specified for column "${prop.key}"`);
      if (prop.grid) {
        columnHeaders += /*html*/ `<div class="exf-lv-headers__header ${
          prop.class || ""
        }" data-property="${prop.key}" style="grid-area: ${
          prop.key
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
    this.properties.forEach((prop) => {
      columnHtml += this.getGridDiv(item, prop);
    });
    return /*html*/ `<article data-id="${item.id}" class="exf-lv-item">
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
      : item[prop.key];
    if (this.isElement(cellData)) {
      const el = document.createElement("div");
      el.appendChild(cellData);
      cellData = el.innerHTML;
    }
    if (prop.type && prop.type === "img") {
      cellData = `<div class="exf-lv-item__cell__content__img" style="background-image: url(${
        item[prop.key]
      })"></div>`;
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

    const cellTemplate = `<div class="${classes.join(" ")}" style="grid-area: ${
      prop.key
    }; ${prop.style || ""}" data-property="${prop.key}">
        <div class="exf-lv-item__cell__content">{{content}}</div>
    </div>`;

    if (prop.grid && prop.grid.filterInPlace) {
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
    const sizes = ["xs", "sm", "md", "lg", "xl"];
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
          else applicableSizes.push(...["xs", "sm", "md", "lg"]);
        } else applicableSizes.push(...["xs", "sm", "md", "lg"]);

        applicableSizes.forEach((as) => {
          gridTemplate[as].columns.push(width);
          gridTemplate[as].areas.push(prop.key);
        });
      }

      if (prop.tiles) {
        tileTemplate[mappingOrders.tiles.indexOf(prop.key)] =
          !prop.tiles.height ||
          prop.tiles.height.trim() === "100%" ||
          prop.tiles.autoHeight
            ? "1fr"
            : prop.tiles.height.trim();
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
    this.minimum = this.minimum || 1;
    return `Select at least ${this.minimum} item(s)`;
  }

  set valid(valid) {
    this._valid = this.required ? valid : true;
  }

  get valid() {
    return this._valid;
  }
}

export default ExoListViewControl;
