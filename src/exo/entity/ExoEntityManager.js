import xo from '../../../js/xo';
import Core from '../../pwa/Core';
import ExoEntitySettings from './ExoEntitySettings';
import ExoEntityEditor from './ExoEntityEditor';

class ExoEntityManager {

  static Settings = ExoEntitySettings;

  static Editor = ExoEntityEditor;

  constructor(options) {
    this.options = options;
    this.events = new Core.Events(this);
    this.entitySettings = new ExoEntitySettings(options);
    this.api = this.entitySettings.api;
  }

  async list() {
    await this.entitySettings.init()

    let frm = await xo.form.run(this.entitySettings.forms.list.schema, {
      context: this.options.context,
      on: {
        schemaLoaded: (e) => {
        },
        renderReady: (e) => {
          this.exo = e.detail.host;
          const grid = this.exo.get("grid")._control;
          grid
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

              this.startEdit(data);
            })
            .on("startAdd", () => {
              this.startEdit({});
            });
        },
      }
    });
    return frm;
  }

  startDelete(ids) {
    if (!Array.isArray(ids) || !ids.length) {
      return;
    }

    let promises = [];
    const grid = this.exo.get("grid")._control;

    ids.forEach((id) => {
      promises.push(this.api.delete(id));
    });

    Promise.all(promises)
      .then(() => {
        grid.events.trigger("finishDelete", { success: true });
      })
      .catch((ex) => {
        console.warn(ex.toString());
        grid.events.trigger("finishDelete", { success: false });
      })
      .finally(() => {
        pwa.UI.notifications.add(
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
   */
  async startEdit(data) {
    const me = this;
    data = data || this._getSelectedItemData() || {};

    this.editor = await this.createEditor(data);
    this.editing = true;
    this.editor.show()
  }

  async createEditor(data) {
    await this.entitySettings.init();
    let ev = new CustomEvent("edit", {
      bubbles: false,
      cancelable: true,
      detail: {
        host: this,
        item: data
      },
    });

    var returnValue = this.events.trigger(ev);

    if (!returnValue) return; // If host has cancelled, don't continue standard editing process

    return new ExoEntityEditor(this, data)
  }

  _getSelectedItemData() {
    if (!this.currentId) return {};

    let data = this.gridControl.currentData.find((r) => {
      return r.id === this.currentId;
    });

    return data;
  }

  set busy(value) {
    this.events.trigger(value ? "busy" : "ready");
  }


}

export default ExoEntityManager;
