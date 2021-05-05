import ExoForm from './ExoForm';
import ExoBaseControls from './ExoBaseControls';
import ExoExtendedControls from './ExoExtendedControls';
import ExoDevControls from './ExoDevControls';
import ExoChartControls from './ExoChartControls';
import ExoSchemaGenerator from './ExoSchemaGenerator';
import ExoFormThemes from './ExoFormThemes';
import ExoFormValidation from './ExoFormValidation';
import ExoFormNavigation from './ExoFormNavigation';
import ExoFormProgress from './ExoFormProgress';
import ExoFormRules from './ExoFormRules'

/**
 * Hosts an ExoForm context to create forms with.
 * Created using {ExoFormFactory}.build()
 * 
 * @hideconstructor
 */
export class ExoFormContext {
    constructor(config) {
        this.config = config;
        this.baseUrl = document.location.origin;
        this.library = this._enrichMeta(config.library)
    }

    _enrichMeta(library) {
        const form = this.createForm({
            internal: true
        });
        form.load({ pages: [{}] });

        for (var name in library) {
            let field = library[name];
            let context = {
                exo: form,
                field: {
                    name: name,
                    type: name
                }
            };
            let control = name !== "base" ? new field.type(context) : { acceptedProperties: [] };
            field.returns = field.returnValueType ? field.returnValueType.name : "None";
            field.element = control.htmlElement ? control.htmlElement.tagName.toLowerCase() : "none";
            field.properties = this._getProps(field, field.type, control);
            field._key = name;
        }

        return library;
    }

    _getProps(field, type, control) {
        let ar = {};

        if (field.returnValueType) {
            ar.name = {
                type: "string",
                description: "Name of the field. Determines posted value key"
            }
            ar.required = {
                type: "boolean",
                description: "Makes the field required. The form cannot be posted when the user has not entered a value in thisn field."
            }

        }

        ar.caption = {
            type: "string",
            description: "Caption text. Normally shown in a label element within the field container"
        }

        if (control && control.acceptedProperties.length) {
            control.acceptedProperties.forEach(p => {
                let name = p;
                if (typeof (p) === "object") {
                    name = p.name
                }
                delete p.name;
                p.type = p.type || String;
                p.type = p.type.name;

                ar[name] = p;
            })
        }
        return ar
    }

    createForm(options) {
        // the only place where an ExoForm instance can be created       
        return new ExoForm(this, options)
    }

    get(type) {
        return this.library[type]
    }

    /**
    * Searches the control library using @param {Function} callback.
    * @return {Array} - list of matched controls.
    */
    query(callback) {

        for (var name in this.library) {
            var field = this.library[name];
            if (callback.apply(this, [field]))
                return field;
        }
    }

    isExoFormControl(formSchemaField) {
        let field = this.get(formSchemaField.type);

        return (field.type.prototype instanceof ExoFormFactory.library.base.type)
    }

    renderSingleControl(field) {
        return this.createForm().renderSingleControl(field);
    }

    createGenerator() {
        return new ExoSchemaGenerator();
    }
}

/**
 * Factory class for ExoForm - Used to create an ExoForm context.
 * Provides factory methods. Starting point for using ExoForm. 
 * 
 * @hideconstructor
 */
class ExoFormFactory {

    static _ev_pfx = "exf-ev-";

    static events = {
        beforePage: ExoFormFactory._ev_pfx + "before-page", // cancellable - called just before paging
        page: ExoFormFactory._ev_pfx + "page", // after moving to other page
        getListItem: ExoFormFactory._ev_pfx + "get-list-item", // 
        post: ExoFormFactory._ev_pfx + "post", // on form post/submit
        renderStart: ExoFormFactory._ev_pfx + "render-start", // when form rendering starts
        renderReady: ExoFormFactory._ev_pfx + "render-ready", // when form rendering is complete
        //change: ExoFormFactory._ev_pfx + "change", // when any control on the form changes
        reportValidity: ExoFormFactory._ev_pfx + "report-validity", // when form control validity is reported
        schemaLoaded: ExoFormFactory._ev_pfx + "form-loaded", // when loading the form schema is complete
        interactive: ExoFormFactory._ev_pfx + "form-interactive", // when form is actually shown to user
        dataModelChange: ExoFormFactory._ev_pfx + "datamodel-change", // when the underlying datamodel to which the form is bound changes
        error: ExoFormFactory._ev_pfx + "error" // when any error occurs
    }

    static meta = {
        navigation: {
            type: ExoFormNavigation,
            description: "Navigation component"
        },
        validation: {
            type: ExoFormValidation,
            description: "Validation component"
        },
        progress: {
            type: ExoFormProgress,
            description: "Progress display component"
        },
        theme: {
            type: ExoFormThemes,
            description: "Theme component"
        },
        rules: {
            type: ExoFormRules,
            description: "Rules component"
        }
    }

    static Context = ExoFormContext;

    static defaults = {
        imports: [ ],
        defaults: {
            navigation: "auto",
            validation: "default",
            progress: "auto",
            theme: "material"
        }
    }

    //TODO: add all relevant classes
    static html = {
        classes: {
            formContainer: "exf-container",
            pageContainer: "exf-page",
            elementContainer: "exf-ctl-cnt",
            groupContainer: "exf-input-group",
            groupElementCaption: "exf-caption"

        }
    }

    static library = {};


    /**
     * Build {ExoFormContext} instance.
     * 
     */
    static build(options) {
        options = options || {};

        return new Promise((resolve, reject) => {
            var promises = [];
            options = {
                ...this.defaults,
                ...options
            }
            //options.imports = options.imports || this.defaults.imports;

            // add standard controls from Base Libraries
            
            this.add(ExoBaseControls.controls);
            this.add(ExoExtendedControls.controls);
            this.add(ExoDevControls.controls);
            this.add(ExoChartControls.controls);

            if (options.add) {
                options.imports.push(...options.add);
            }

            options.imports.forEach(imp => {
                promises.push(
                    ExoFormFactory.loadLib(imp)
                )
            });
            
            Promise.all(promises).then(() => {
                let lib = ExoFormFactory.buildLibrary();
                console.debug("ExoFormFactory loaded library", lib, "from", options.imports);
                resolve(new ExoFormContext({
                    ...options,
                    library:lib
                }));
            });
        })
    }

    static buildLibrary() {
        for (var name in ExoFormFactory.library) {
            var field = ExoFormFactory.library[name];
            field.typeName = name;
            field.returnValueType = String;
            field.type = this.lookupBaseType(name, field);

            field.isList = (field.type.prototype instanceof ExoFormFactory.library.list.type)
            if (field.isList) {
                field.isMultiSelect = field.type.isMultiSelect;
            }
            field.returnValueType = field.type.returnValueType;

            if (["date"].includes(field.typeName)) {
                field.returnValueType = Date;
            }
        }
        return ExoFormFactory.library;
    }

    static lookupBaseType(name, field) {
        let type = field.type;
        while (type === undefined) {
            if (field.base) {
                field = this.library[field.base];
                if (!field)
                    console.error("Invalid base type", field.base);

                type = field.type;

                if (!(type.prototype instanceof ExoFormFactory.library.base.type)) {
                    console.error("Class for " + name + " is not derived from ExoControlBase");
                }
            }
            else {
                break
            }
        }
        return type;
    }

    static async loadLib(src) {
        let lib = await import(src);
        let customType = lib.default;
        this.add(customType.controls);
    }

    // called from library implementations
    static add(lib) {
        //console.debug("Loading ", lib);

        for (var name in lib) {
            var field = lib[name];
            ExoFormFactory.library[name] = field;
        }
    }

    static listNativeProps(ctl) {
        let type = ctl.__proto__;
        let list = Object.getOwnPropertyNames(type);
        let ar = /* id added 26 Apr 2021*/
            ["id", "style", "class", "accesskey", "contenteditable",
                "dir", "disabled", "hidefocus", "lang", "language", "tabindex", "title", "unselectable",
                " xml:lang"];


        list.forEach(p => {
            let d = Object.getOwnPropertyDescriptor(type, p);
            let hasSetter = d.set !== undefined;
            if (hasSetter) {
                ar.push(p.toLowerCase())
            }
        });
        return ar;
    }

    static loadCustomControl(f, src) {
        return ExoFormFactory.importType(src);
    }

    static async importType(src) {
        return await import(src);
    }

    static checkTypeConversion(type, rawValue) {
        let fieldMeta = ExoFormFactory.library[type];
        let value = undefined;

        if (fieldMeta) {
            try {
                const parse = ExoFormFactory.getTypeParser(fieldMeta);
                value = parse(rawValue);
                if (value !== rawValue)
                    console.debug("Value '", rawValue, "' for field", type, " converted to", value, typeof (value));
            }
            catch (ex) {
                console.error("Error converting '" + value + "'to " + fieldMeta.returnValueType, ex);
            }

        }
        return value;
    }

    static getTypeParser(fieldMeta) {
        let type = fieldMeta.returnValueType;
        switch (type) {
            case Number: return Number.parseFloat;
            case Date: return ExoFormFactory.parseDate;
            case Boolean: return ExoFormFactory.parseBoolean;
            default:
                return v => { return v }

        }
    }

    static parseDate(value) {
        let dateValue = Date.parse(value);
        if (!isNaN(dateValue))
            return new Date(dateValue).toJSON();

        return dateValue;
    }

    static parseBoolean(value) {
        return parseInt(value) > 0 || value === "1" || value === "true" || value === "on";
    }

    static getFieldFromElement(e, options) {
        options = {
            master: false,
            ...(options || {})
        }
        let field = null;
        if (e.getAttribute("data-exf")) {
            field = e.data["field"];
        }
        else if (e.classList.contains("exf-ctl-cnt")) {
            e = e.querySelector("[data-exf]");
            if (e) {
                field = e.data["field"];
            }
        }
        else {
            e = e.closest("[data-exf]");
            if (e) {
                field = e.data["field"];
            }
        }

        if(e && options.master){
            let masterElement = e.closest("[exf-data-master]");
            if(masterElement){
                e = masterElement;
                field = e.data["field"];
            }
        } 

        return field;
    }

    static fieldToString(f) {
        if (f) {
            let type = f.type || "unknown type";
            if (f.isPage)
                return "Page " + f.index + " (" + type + ")";
            else if (f.name || (f.id && f.elm))
                return "Field '" + (f.name || f.id) + "' (" + type + ")";

        }

        return "Unknown field";
    }

}

export default ExoFormFactory;