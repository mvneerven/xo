import ExoForm from './ExoForm';
import ExoBaseControls from './controls/base/ExoBaseControls';
import ExoExtendedControls from './controls/ExoExtendedControls';
import ExoDevControls from './controls/ExoDevControls';
import ExoChartControls from './controls/ExoChartControls';
import ExoFormThemes from './themes/ExoFormThemes';
import ExoFormValidation from './validation/ExoFormValidation';
import ExoFormNavigation from './navigation/ExoFormNavigation';
import ExoFormProgress from './progress/ExoFormProgress';
import ExoFormRules from './validation/ExoFormRules'
import ExoFormSchema from './ExoFormSchema';

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
        let x = new ExoForm(this, options)
        return x;
    }

    createSchema() {
        return new ExoFormSchema(this);
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
}

/**
 * Factory class for ExoForm - Used to create an ExoForm context.
 * Provides factory methods. Starting point for using ExoForm. 
 * 
 * @hideconstructor
 */
class ExoFormFactory {

    static events = {
        schemaLoaded: "schemaLoaded", // when loading the form schema is complete
        renderStart: "renderStart", // when form rendering starts
        getListItem: "getListItem", // 
        renderReady: "renderReady", // when form rendering is complete
        interactive: "interactive", // when form is actually shown to user
        reportValidity: "reportValidity", // when form control validity is reported
        dataModelChange: "dataModelChange", // when the underlying datamodel to which the form is bound changes
        beforePage: "beforePage", // cancellable - called just before paging
        page: "page", // after moving to other page
        pageRelevancyChange: "pageRelevancyChange", // when a page's relevancy state changes (e.g. moves in/out of scope)
        post: "post", // on form post/submit
        error: "error" // when any error occurs
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
        imports: [],
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
            groupElementCaption: "exf-caption",
            label: "exf-label",
            navigationContainer: "exf-nav-cnt",
            button: "exf-btn",
            focusedControlContainer: "exf-focus",
            pageTitle: "exf-page-title",
            pageIntroText: "exf-page-intro",
            textBasedControl: "exf-base-text",
            disabledControl: "exf-disabled"


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
                console.debug("ExoFormFactory: loaded library", lib, "from", options.imports);
                resolve(new ExoFormContext({
                    ...options,
                    library: lib
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
        for (var name in lib) {
            var field = lib[name];
            ExoFormFactory.library[name] = field;
        }
    }

    /**
     * Determines the ExoForm schema type from an object.
     * @param {Object} value 
     * @returns {String} - the detected type ("field", "json-schema" or "form")
     */
    static determineSchemaType(value) {
        if (typeof (value) === "object") {
            if(value.$schema) {
                return "json-schema";
            }
            if (value.type && value.name) {
                return "field";
            }
        }

        return "form";
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

    static tryScriptLiteral(scriptLiteral) {
        let result = {
            raw: scriptLiteral,
            guessedType: typeof (scriptLiteral) === "string" && scriptLiteral.trim().startsWith("const") ? "javascript" : "json",
            schema: undefined,
            type: "unknown",
            parsed: false,
            executed: false,
            error: ""
        };
        if (result.guessedType === "javascript") {
            try {
                const f = new Function("function s(){" + scriptLiteral + "; return schema};return s()");
                result.type = "javascript"
                result.parsed = true,

                    result.schema = f.call();
                result.executed = true;

            }
            catch (ex) {
                console.error("tryScriptLiteral", ex)
                result.error = ex.toString();
            }
            finally {
                return result;
            }
        }
    }

    static checkTypeConversion(type, rawValue) {
        let fieldMeta = ExoFormFactory.library[type];
        let value = undefined;

        if (fieldMeta) {
            try {
                const parse = ExoFormFactory.getTypeParser(fieldMeta);
                value = parse(rawValue);
                if (value !== rawValue)
                    console.debug("ExoFormFactory: value '", rawValue, "' for field", type, " converted to", value, typeof (value));
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

        if (e && options.master) {
            let masterElement = e.closest("[exf-data-master]");
            if (masterElement) {
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