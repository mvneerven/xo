import Core from '../../pwa/Core';

class ExoEntityManager {
  _state = -1;

  static states = {
    initializing: 0,
    initialized: 1,
    ready: 2
  }

  options = {
    filter: ""
  }

  _defaults = {
    forms: {
      list: {
        control: {
          name: "grid",
          type: "listview",
          pageSize: 8,
          views: ["grid", "tiles"],

          items: this._getDataAsync.bind(this),

          mappings: {},

          contextMenu: {
            direction: "left",
            items: [
              {
                tooltip: "Edit",
                icon: "ti-pencil",
                action: "edit",
              },
              {
                tooltip: "Delete",
                icon: "ti-close",
                action: "delete",
              },
            ],

          },

          listen: {
            ready: (e) => {
              if (this.options.search) {
                e.detail.host.filterListView(this.options.search);
              }
            },
          },

          controls: [
            {
              type: "search",
              name: "filter",
              placeholder: "Type to filter...",
              listener: "input",
              class: "exf-listview-flt",
              value: this.options.filter || "",
            },
            {
              type: "button",
              name: "del",
              icon: "ti-close",
              caption: "",
              tooltip: "Delete selected",
              useSelection: true,
            },
            {
              type: "button",
              name: "add",
              class: "btn-primary",
              icon: "ti-plus",
              caption: "",
              tooltip: "Add item",
            },
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
                  name: `<span class="ti-check-box"></span> Select all`,
                  tooltip: "Select all",
                  title: "select",
                  type: "event",
                },
                {
                  name: `<span class="ti-layout-width-full"></span> Deselect all`,
                  tooltip: "Deselect all",
                  title: "deselect",
                  type: "event",
                },
              ],
            },
          ],

          properties: []
        }
      },
      edit: {
        schema: {
          navigation: "static",
          model: {
            schemas: {
              data: undefined
            },
            instance: {
              data: {},
            },
            logic: (context) => {
              let m = context.model;
              m.bindings.edit = !m.instance.data.id;
            },
          },
          mappings: {}
        }
      }
    }
  }

  static events = {
    stateChange: "stateChange",
    initializing: "initializing",
    initialized: "initialized",
    ready: "ready",
    busy: "busy",
    startEdit: "startEdit",
    startDelete: "startDelete"
  }

  constructor(options) {
    if (!options || !options.jsonSchema || !options.api)
      throw TypeError("Missing options");

    this.events = new Core.Events(this);
    this.options = {
      ...this._defaults,
      ...options
    };
  }

  async list() {
    await this.checkLoaded()

    let frm = await xo.form.run(this.forms.list.schema, {
      context: this.options.context,
      on: {
        schemaLoaded: (e) => {
        },
        renderReady: (e) => {
          this.exo = e.detail.host;
          const grid = this.exo.get("grid");
          grid._control
            .on("delete", (e) => {
              if (!Array.isArray(e.detail.data)) {
                e.detail.data = [e.detail.data.id];
              }
              this.startDelete(e.detail.data);
            })
            .on("edit", (e) => {
              let ids = e.detail.data;
              if (!Array.isArray(ids)) ids = [ids];
              const data = e.detail.items.find((i) => i.id === ids[0]);
              this.startEdit(data, e.detail.items);
            })
            .on("startAdd", () => {
              this.startEdit({});
            });
        },
      },
    });

    return frm;
  }

  async edit() {
    await this.checkLoaded();
  }

  async checkLoaded() {
    if (this.state < ExoEntityManager.states.initialized) {
      await this.readJSONSchema();
      try {
        if (typeof (this.options.map) === "function") {
          let mapped = this.options.map(this.options.forms);
          this.tryReApplyListProperties(mapped) // object struct to array
          this.applyMappings(this.options.forms, mapped)
        }
      }
      finally {
        this.state = ExoEntityManager.states.initialized;
      }
    }
  }

  applyMappings(obj, mapped) {
    for (var p in mapped) {
      if (typeof (mapped[p]) === "object") {
        if (obj[p]) {
          this.applyMappings(obj[p], mapped[p])
        }
        else {
          obj[p] = mapped[p];
        }
      }
      else {
        obj[p] = mapped[p] || obj[p]
      }
    }
  }

  // if mapped.list.control.properties are returned by map(),
  // it's an object structure with key: {prop1: value1, prop2: value2}
  // while the listview works with an array of properties
  tryReApplyListProperties(mapped) {
    let ar = this.options.forms.list.control.properties;
    if (Array.isArray(ar)) {
      let ar1 = [];
      if (mapped && mapped.list && mapped.list.control) {
        let obj = mapped.list.control.properties;
        if (typeof (obj) === "object") {

          ar.forEach(p => {
            let item = p;
            if (obj[p.key]) {
              item = {
                ...p,
                ...obj[p.key]
              }
            }
            ar1.push(item);
          });
        }
      }
      mapped.list.control.properties = ar1;
    }
  }

  get forms() {
    return {
      list: {

        schema: {
          model: {
            instance: {
              data: {},
            },
            logic: (context) => {
              const m = context.model;
              m.bindings.noSelection = true;
              this.model = m;
            },
          },
          navigation: "none",
          pages: [
            {
              legend: "",
              intro: "",
              fields: [
                this.options.forms.list.control
              ]
            },
          ],
        }
      },

      edit: {


      }
    }
  }

  _getDataAsync() {
    return new Promise((resolve) => {
      this.busy = true;
      this.options.api
        .get()
        .then((data) => {
          resolve(data);
        })
        .finally(() => {
          setTimeout(() => {
            this.busy = false;
          }, 100);
        });
    });
  }

  startDelete(ids) {
    if (!Array.isArray(ids) || !ids.length) {
      return;
    }

    let promises = [];
    const grid = this.exo.get("grid");

    ids.forEach((id) => {
      promises.push(this.api.delete(id));
    });

    Promise.all(promises)
      .then(() => {
        grid._control.events.trigger("finishDelete", { success: true });
      })
      .catch((ex) => {
        console.warn(ex.toString());
        grid._control.events.trigger("finishDelete", { success: false });
      })
      .finally(() => {
        window.app.UI.notifications.add(
          `Deleted ${ids.length} item${ids.length === 1 ? "s" : ""}.`,
          {
            type: "info",
            timeout: 3000,
            buttons: {
              undo: {
                caption: "Undo",
                click: (e) => {
                  //alert(e)
                },
              },
            },
          }
        );
      });
  }

  /**
   * Starts the editor dialog
   * @param {Object} data - the entity DTO to be edited (if any)
   * @returns the editDialog as generated
   */
  async startEdit(data, items) {
    const me = this;
    data = data || this._getSelectedItemData() || {};
    this.editing = true;

    let schema = {
      ...this.options.forms.edit.schema
    }
    schema.model.instance.data = data;

    const editFrm = await xo.form.run(schema, {
      context: this.options.exoContext,

      on: {
        schemaLoaded: async (e) => {
          this.editorForm = e.detail.host;
          me.events.trigger("editFormLoaded", {
            exo: e.detail.host,
          });
        },
      },
    });

    this.editDialog = await this.showDialog({
      modal: false,
      title: data.id ? `Edit` : `Add`,
      body: editFrm,
      confirmText: "Save",
      cancelText: "Cancel",

      click: (button, event) => {
        this._handleButtonClick(event, button);
      },
    });

    // hook dialog button to form state (dialog buttons are not a part of the form)
    let confirmBtn = this.editDialog.dlg.querySelector("button.confirm");
    this.editDialog.dlg
      .querySelector("form")
      .addEventListener("change", (e) => {
        let fn = this.editorForm.addins.validation.checkValidity()
          ? "enable"
          : "disable";
        DOM[fn](confirmBtn);
      });
    return this.editDialog;
  }

  async _handleButtonClick(e, button) {
    if (e && e.target && e.target.tagName !== "BUTTON") {
      e.cancelBubble = true;
      return;
    }

    if (button === "confirm") {
      const editData = this.editData;
      //const grid = this.exo.get("grid");
      //const trigger = editData.id ? "finishEdit" : "finishAdd";
      try {
        if (editData.id) {
          await this.api.put("", editData);
        } else {
          await this.api.post("", editData);
        }
        // grid._control.events.trigger(trigger, { success: true });
      } catch (err) {
        // grid._control.events.trigger(trigger, { success: false });
      } finally {
        this.editing = false;
      }
    }
  }

  _getSelectedItemData() {
    if (!this.currentId) return {};

    let data = this.gridControl.currentData.find((r) => {
      return r.id === this.currentId;
    });

    if (data) {

      debugger;

      return {
        ...data,
        url: data.imageUri,
      };
    }
  }

  async showDialog(options) {

    let r = await xo.form.run({
      ...options || {},
      type: "dialog"
    });
    var f = xo.form.factory.getFieldFromElement(r);
    f._control.show();
    return f._control;

  }

  set busy(value) {
    this.events.trigger(value ? "busy" : "ready");
  }

  get state() {
    return this._state;
  }

  set state(value) {
    if (value != this._state) {

      this._state = value;
      this.events.trigger(ExoEntityManager.events.stateChange);

      switch (this.state) {
        case ExoEntityManager.states.initializing:
          this.events.trigger(ExoEntityManager.events.initializing);
          break;
        case ExoEntityManager.states.initialized:
          this.events.trigger(ExoEntityManager.events.initialized);
          break;
        case ExoEntityManager.states.ready:
          this.events.trigger(ExoEntityManager.events.ready);
          break;
      }

    }
  }

  async readJSONSchema() {
    this.state = ExoEntityManager.states.initializing;

    const schema = await xo.form.factory.readJSONSchema(this.options.jsonSchema);
    this.options.forms.edit.schema.model.schemas.data = this.options.jsonSchema;

    this.options.forms.list.control = {
      ...this.options.forms.list.control,
      properties: this.distilListProperties(schema),
    }

    this.state = ExoEntityManager.states.initialized
  }

  distilListProperties(schema) {
    const properties = [];
    Object.keys(schema.properties).forEach((key) => {
      const prop = schema.properties[key];
      properties.push({
        key,
        type: prop.type,
        name: prop.title,
      });
    });
    return properties;
  }

  formatValue(value, options) {
    options = options || { type: "currency", country: "nl", currencyCode: "EUR" }

    if (options.type === "currency")
      return new Intl.NumberFormat(options.country,
        { style: 'currency', currency: options.currencyCode }).format(value);

  }
}

export default ExoEntityManager;
