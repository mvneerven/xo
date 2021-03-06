import JSONSchema from "../exo/core/JSONSchema";
import Core from "./Core";
import PWA_SettingsSection from "./PWA_SettingsSection";
import PWA_SettingsGroup from "./PWA_SettingsGroup";

class PWA_Settings {

    // form schema 
    schema = {
        navigation: "static",
        validation: "inline",
        model: { instance: {} }
    }

    constructor() {
        this._sections = {}
    }

    createGroup(sectionName, settings) {
        
        let ar = [...arguments];
        ar.shift();

        let sg = new PWA_SettingsGroup(this, sectionName, ...ar);
        this.add(sg);
        return sg;
    }

    /**
     * Adds one or more settings and groups them in a Section
     * @param {*} sectionName - the group name of the section
     * @param {Object} settings - param array of JSON-Schema properties
     * @returns {PWA_Settings} settings object
     */
    add(settingsGroup) {
        let sec = settingsGroup.section;
        sec.items = settingsGroup.settings;
        return sec;
    }

    _getSection(name) {
        let id = Core.toPascalCase(name).replace(" ", "");
        let sec = this._sections[id];
        if (!sec) {
            sec = new PWA_SettingsSection(name);
            sec.title = name;
            sec.id = id;
            sec.binding = "#/" + sec.id + "/";
            this.schema.model.instance[sec.id] = {};

            this._sections[sec.id] = sec;
        }
        return sec;
    }

    build() {
        this.schema.pages = this.generateFormPages()
    }

    async render(options) {
        this.build();
        
        console.debug("Settings Model", this.schema.model);

        const defOptions = {
            on: {
                schemaParsed: e => {
                    let instances = e.detail.host.schema.model.instance;
                    for (var n in instances) {
                        let sec = this._sections[n];
                        let o = { instance: {} };
                        sec.events.trigger("read", o);
                        if (o.instance.data) {
                            e.detail.host.schema.model.instance[n] = o.instance.data
                        }
                    }
                },
                dataModelChange: e => {
                    let b = e.detail.changed;
                    if (b) {
                        
                        let sec = this._sections[e.detail.changeData.instanceName]; 
                        sec.events.trigger("write", {
                            changed: b,
                            instance: {
                                data: e.detail.model.instance[sec.id]
                            }
                        })
                    }
                }
            }
        }

        options = options || {};
        options.on = {
            ...options.on || {},
            ...defOptions.on
        }


        return xo.form.run(this.schema, options)
    }

    generateFormPages() {
        let ar = [];

        for (var id in this._sections) {
            let sec = this._sections[id];
            
            ar.push({
                legend: sec.title,
                intro: sec.description,
                fields: this.generateFields(sec)
            })
        }

        return ar;
    }

    generateFields(sec) {
        let ar = [];
        sec.items.forEach(i => {
            let field = {
                name: i.name,
                caption: i.title,
                info: i.description,
                bind: sec.binding + i.name
            }
            let els = JSONSchema.mapType(field, i);
            for (var e in els) {
                field[e] = els[e];
            }

            if(i.ui){
                field = {
                    ...field,
                    ...i.ui
                }
            }

            ar.push(field);
        });
        return ar;
    }
}


export default PWA_Settings;