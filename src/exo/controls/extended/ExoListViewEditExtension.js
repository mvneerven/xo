
class ExoListViewEditExtension {

    constructor(listView, options) {

        this.mode = "side";

        this.listview = listView;
        if (!this.listview)
            throw TypeError("The listdetails control must be attached to a listview")

        this.listview.on("action", async e => {
            switch (e.detail.id) {
                case "edit":

                    this.props = this.listview.properties;
                    this.idProp = this.props[0]?.key || "id";
                    this.listId = e.detail.items[0];
                    let data = this.listview.currentItems?.find(i => { return i[this.idProp] === this.listId });


                    let dlg = await xo.dom.showDialog({// show edit dialog
                        mode: "side",
                        body: this.generateEditForm(data),
                        click: async (button, event) => {
                            if (button === "confirm") {
                                this.save();
                            }
                        }
                    });

                    dlg.on("ready", e => {
                        let frm = xo.form.from(e.detail.body);
                        this.editData = frm.dataBinding.model.instance.data;

                    })
                    break;
            }
        })

        return this.container;
    }

    save() {


        let j = 0, ix;
        this.listview.tableItems.forEach(i => {
            if (i[this.idProp] === this.listId) {
                ix = j;
            }
            j++;
        });

        this.listview.tableItems[ix] = { ...this.listview.tableItems[ix], ...this.editData }
        //console.log(this.listview.currentItems);

        this.listview.refresh()



    }

    generateEditForm(data) {

        const schema = {
            submit: false,
            model: {
                instance: {
                    data: {}
                }
            },
            pages: [{ fields: [] }]
        };

        this.props.forEach(p => {
            schema.model.instance.data[p.key] = data[p.key];
            schema.pages[0].fields.push(this.getField(p, data))
        })

        return schema
    }

    getField(prop, data) {
        const field = {
            bind: "#/data/" + prop.key,
            caption: prop.name,
            ...prop.edit
        }
        return field;
    }
}

export default ExoListViewEditExtension;