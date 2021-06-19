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
    }
  ];

  viewIndex = 0;
  currentPage = 1;
  pageSize = undefined;
  currentItems = [];

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
        description: "Current view (tiles, grid, details)",
      },
      {
        name: "pageSize",
        type: Number,
      },
      {
        name: "controls", // default _controls now used
      },
      {
        name: "columns",
        type: Array,
        description:
          "Object array containing item key as key, the column header as title and the width op the column as width",
      },
      {
        name: "actionMenu",
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

    this.dataCallback = (header, value) => {
      let val = value[header];
      if (!val) {
        if (header === "tile-name") {
          val = value["name"]
        }
        else if (header === "tile-description")
          val = value["description"]

        else if (header === "tile-img" || header === "imageUri"){
          val = value["image"] || value["imageUri"]
          

          if(header === "imageUri"){
            val = DOM.parseHTML(
              /*html*/ `<div class="exf-lv-grid-img" style="background-image: url(${val})"></div>`
            );
          }
        }
        else{
          
          val = ""
        }

      }
      return val;
    };
    this.dataCallback = this.context.field.dataCallback || this.dataCallback;

    this.renderList();
    this.renderLoading();
    if (this.controls) await this.addControls();
    this.renderItems();

    this.container.classList.add("exf-listview");
    this.view = this.views[this.viewIndex]; // set initial view - can be toggled using button bar

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

      if (this.pageSize && this.view !== this.views[0]) {
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
      document.documentElement.style.setProperty("--lv-tile-template", "1fr");
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
          `<button class="exf-btn">${button.template}</button>`
        );
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.pagingButtonClickEvent(button.value);
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

    this.columns
      .filter((col) => col.sort)
      .forEach((col) => {
        const header = this.listDiv.querySelector(
          `.exf-lv-headers [data-column="${col.mappedTo}"]`
        );
        header.dataset.sort = SortingTypes.UNSET;

        header.addEventListener("click", () => {
          this.listDiv
            .querySelectorAll(
              `.exf-lv-headers [data-sort]:not([data-column="${col.mappedTo}"])`
            )
            .forEach((el) => {
              if (el.dataset.sort) el.dataset.sort = SortingTypes.UNSET;
            });
          header.dataset.sort = this.getSort(header.dataset.sort);

          this.renderItems(false);
        });
      });
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

    document.documentElement.style.setProperty(
      "--lv-tile-template",
      "repeat(auto-fill, minmax(200px, 1fr))"
    );

    for (const i of items) {
      const template = DOM.parseHTML(this.getTemplate(i));
      if (this.actionMenu) {
        const abGrid = await this.createActionButton(i);
        template
          .querySelector(`[data-column="actions"] .exf-lv-item__grid__content`)
          .appendChild(abGrid);

        const abTile = await this.createActionButton(i);
        abTile.classList.add("exf-lv-item__tile", "action-button");
        abTile.dataset.column = "actions";
        template.appendChild(abTile);

        [abGrid, abTile].forEach(async (actionButton) => {
          const am = await this.getData(this.actionMenu, i);
          am.forEach((menuItem) => {
            // add listener for button press
            actionButton.addEventListener(menuItem.title, (e) => {
              const parentArticle = actionButton.closest("article.exf-lv-item");
              const data = this.tableItems.find(
                (tableItem) => tableItem.id === parentArticle.dataset.id
              );
              this.events.trigger(menuItem.title, {
                data,
                items: this.tableItems,
              });
            });
          });

          // set fixed position of dropdown menu
          const actionBtn = actionButton.querySelector(".exf-dropdown-cnt");
          actionBtn.addEventListener("mouseenter", () => {
            const rect = actionBtn.getBoundingClientRect();
            const menu = actionBtn.querySelector(".exf-btn-dropdown");
            menu.style.position = "fixed";
            menu.style.top = `${rect.y + rect.height}px`;
            menu.style.right = `${document.body.clientWidth - rect.x - rect.width
              }px`;
          });
        });
      }

      const pagingRow = this.listDiv.querySelector(".exf-lv-paging");
      if (pagingRow) this.listDiv.insertBefore(template, pagingRow);
      else this.listDiv.appendChild(template);
      const elm = this.listDiv.querySelector(`[data-id="${i.id}"]`);
      elm.addEventListener("click", (e) => {
        // if clicked on element inside action dropdown, don't select
        if (e.target.closest(".exf-dropdown-cnt")) {
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
        ".exf-lv-item__grid:not(.overflowing):not([data-column=actions])"
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
      console.log("Specific control", c);
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
            id = act.getAttribute("data-action")
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
    console.log("selection dependencies", this.selectionDependencies);
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
      }
    });
  }

  filterListView(value, items) {
    const filteredItems = [];
    if (!items) items = this.tableItems;
    items.forEach((item) => {
      let content = "";
      this.columns.forEach((col) => {
        const data = this.dataCallback(col.mappedTo, item) || "";
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
    document.documentElement.style.setProperty("--lv-tile-template", "1fr");
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

  toggleSelection(){
    
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
    this.viewIndex++;
    if (this.viewIndex >= this.views.length) this.viewIndex = 0;

    this.view = this.views[this.viewIndex];
    this.renderItems(true);
  }

  // set current view - sets the data-view attribute on container (div.exf-ctl-cnt)
  set view(value) {
    let ix = this.views.indexOf(value);
    if (ix >= 0) {
      this.viewIndex = ix;
      if (this.rendered) this.container.setAttribute("data-view", this.view);
    }
  }

  get view() {
    return this.views[this.viewIndex];
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
    this.columns.forEach((col) => {
      columnHeaders += /*html*/ `<div class="exf-lv-headers__header ${col.class}" data-column="${col.mappedTo}">${col.name}</div>`;
    });
    if (this.actionMenu)
      columnHeaders += `<div class="exf-lv-headers__header" data-column="actions"></div>`;
    this.setColumnGrid();

    return /*html*/ `<div class="exf-lv-headers">
        ${columnHeaders}
    </div>`;
  }

  getTemplate(item) {
    let columnHtml = "";
    this.columns.forEach((col) => {
      columnHtml += this.getTableCell(item, col);
    });

    if (this.actionMenu)
      columnHtml += `<div class="exf-lv-item__grid last-of-grid" data-column="actions">
        <div class="exf-lv-item__grid__content"></div>
    </div>`;

    return /*html*/ `<article data-id="${item.id}" class="exf-lv-item">

        ${this.getTileImage(item)}          
        
        <h3 class="exf-lv-item__tile" data-column="name">
          ${this.dataCallback("tile-name", item) || ""}
        </h3>
        <div class="exf-lv-item__tile">
          ${this.dataCallback("tile-description", item)}
        </div>
        
        ${columnHtml}
    </article>`;
  }

  getTileImage(item) {
    let img = this.dataCallback("tile-img", item);
    if (img) {
      return /*html*/ `<div class="exf-lv-item__tile" style="background-image: url(${img})" data-column="image"></div>`;
    }
    return "";
  }

  getSortedList() {
    const header = this.container.querySelector(
      ".exf-lv-headers [data-sort]:not([data-sort=unset])"
    );
    if (header)
      return this.sortData(header.dataset.column, header.dataset.sort);
    else return this.tableItems;
  }

  sortData(columnKey, sort) {
    let sortedList = [];
    const items = JSON.parse(JSON.stringify(this.tableItems));

    if (sort === SortingTypes.UNSET) sortedList = items;
    else
      sortedList = items.sort((a, b) =>
        this.dataCallback(columnKey, a) >= this.dataCallback(columnKey, b)
          ? 1
          : -1
      );
    if (sort === SortingTypes.DESC) sortedList.reverse();

    return sortedList;
  }

  getTableCell(item, col) {
    let cellData = this.dataCallback(col.mappedTo, item) || "";
    const first = this.columns.indexOf(col) === 0;
    if (this.isElement(cellData)) {
      const el = document.createElement("div");
      el.appendChild(cellData);
      cellData = el.innerHTML;
    }
    const cellTemplate = `<div class="exf-lv-item__grid ${col.class || ""} ${first ? "first-of-grid" : ""
      }" style="${col.style || ""}" data-column="${col.mappedTo}">
        <div class="exf-lv-item__grid__content">{{content}}</div>
    </div>`;

    if (col.filterInPlace) {
      const base = col.searchURL || `${location.href}/`;
      const url = `${base}${cellData}`;
      cellData = `<a href="${url}">${cellData}</a>`;
    }

    return DOM.format(cellTemplate, { content: cellData });
  }

  isElement(element) {
    return element instanceof Element || element instanceof HTMLDocument;
  }

  setColumnGrid() {
    const gridTemplate = { xs: [], sm: [], md: [], lg: [], xl: [] };
    this.columns.forEach((col) => {
      const width =
        !col.width || col.width.trim() === "100%" || col.autoWidth
          ? "1fr"
          : col.width.trim();
      gridTemplate.xl.push(width);
      if (col.class) {
        const classes = col.class.split(" ");
        if (classes.includes("hide-md")) gridTemplate.lg.push(width);
        else if (classes.includes("hide-sm"))
          ["md", "lg"].forEach((size) => gridTemplate[size].push(width));
        else if (classes.includes("hide-xs"))
          ["sm", "md", "lg"].forEach((size) => gridTemplate[size].push(width));
        else if (!classes.includes("hide-lg"))
          ["xs", "sm", "md", "lg"].forEach((size) =>
            gridTemplate[size].push(width)
          );
      } else {
        ["xs", "sm", "md", "lg"].forEach((size) =>
          gridTemplate[size].push(width)
        );
      }
    });
    Object.keys(gridTemplate).forEach((size) => {
      gridTemplate[size].push("auto");
      document.documentElement.style.setProperty(
        `--lv-grid-template-${size}`,
        gridTemplate[size].join(" ")
      );
    });
    document.documentElement.style.setProperty(
      "--lv-tile-template",
      "repeat(auto-fill, minmax(200px, 1fr))"
    );
  }

  async createActionButton(item) {
    const am = await this.getData(this.actionMenu, item);
    return xo.form.run({
      type: "button",
      name: `actions-${item.id}`,
      icon: "ti-menu",
      dropdown: am,
    });
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
    this._valid = valid;
  }

  get valid() {
    return this._valid;
  }
}

export default ExoListViewControl;
