
import ExoBaseControls from '../controls/base/ExoBaseControls';
import ExoExtendedControls from '../controls/extended/ExoExtendedControls';
import ExoDevControls from '../controls/dev/ExoDevControls';
import ExoChartControls from '../controls/ExoChartControls';
import ExoFormThemes from '../themes/ExoFormThemes';
import ExoFormValidation from '../validation/ExoFormValidation';
import ExoFormNavigation from '../navigation/ExoFormNavigation';
import ExoFormProgress from '../progress/ExoFormProgress';
import ExoFormRules from '../rules/ExoFormRules'
import ExoFormContext from './ExoFormContext';
import ExoLiveEditor from '../design/ExoLiveEditor';
import Core from '../../pwa/Core';

/**
 * Factory class for ExoForm - Used to create an ExoForm context.
 * Provides factory methods. Starting point for using ExoForm. 
 * 
 * @hideconstructor
 */
class ExoFormFactory {

    static events = {
        created: "created",
        schemaParsed: "schemaParsed", // parsed raw schema, no processing done
        schemaLoading: "schemaLoading", // initial processing done, JSON schemas (if any) loaded.
        schemaLoaded: "schemaLoaded", // when loading the form schema is complete
        jsonSchemasApplied: "jsonSchemasApplied",
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
        action: "action", // on actions triggered 
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
    
    static LiveEditor = ExoLiveEditor;

    static defaults = {
        imports: [],
        defaults: {
            navigation: "auto",
            validation: "default",
            progress: "auto",
            theme: "material",
            DOMChange: "input"
        }
    }

    //TODO: add all relevant classes
    static html = {
        classes: {
            formContainer: "exf-container",
            pageContainer: "exf-page",
            elementContainer: "exf-ctl-cnt",
            groupContainer: "exf-input-group",
            groupElement: "exf-ilc-cnt",
            caption: "exf-caption",
            groupCaptionMain: "exf-caption-main",
            groupCaptionDescription: "exf-caption-description",
            label: "exf-label",
            navigationContainer: "exf-nav-cnt",
            button: "exf-btn",
            focusedControlContainer: "exf-focus",
            pageTitle: "exf-page-title",
            pageIntroText: "exf-page-intro",
            textBasedControl: "exf-base-text",
            disabledControl: "exf-disabled",
            focusedControl: "exf-focus",
            dirtyControl: "exf-dirty",
            invalidControl: "exf-invalid",
            helpWrapper: "exf-help-wrapper",
            help: "exf-help"
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

    /**
     * Generates meta documentation about all controls in the given control library.
     * @param {Object} library 
     * @returns {Array} - Array containing control metadata.
     */
     static extractControlMeta(library) {
        let ar = [];
        let iter = new Core.Iterator(library, "_key")

        let field = null;
        while (field = iter.next()) {
            let name = field._key;
            if (field.hidden) continue;

            let data = {
                ...field,
                name: name,
                description: field.note,
                type: field.type.name,
                example: field.example || field.demo
            }

            if (!data.example) {
                data.example = { type: data.name, name: data.name + "1" }
            }

            data.example = {
                type: data.name,
                name: field._key,
                caption: Core.toWords(data.name),
                ...data.example
            }

            data.example = JSON.stringify(data.example, null, 2).trim();

            ar.push(data)
        }
        return ar;
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
            if (value.$schema) {
                return "json-schema";
            }
            
            if (value.type && (value.name || !(value.pages) )) {
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

        if (e && options.master) {
            let masterElement = e.closest("[exf-data-master]");
            if (masterElement) {
                e = masterElement;
                field = e.data["field"];
            }
        }

        if (!field) {
            let cnt = e.closest(".exf-ctl-cnt");
            if (cnt) {
                let el = cnt.querySelector("[data-exf]");
                if (el && el.data)
                    field = el.data["field"];
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

    /**
     * Run a form directly and return generated container
     * @param {*} value - JS/JSON schema or a URL to fetch it from.
     * @param {*} options - Object containing options 
     * - context: ExoFormContext
     * - on: object with event listeners 
     *   e.g. 
     *   xo.form.run(schema, {
     *     on: {
     *       post: e => {
     *         // handle post
     *       }
     *     }
     *   })
     * - for DOM event listening, use (on: {dom: {change: e => { ... }}})
     *   xo.form.run(schema, {
     *     on: {
     *       post: e => {
     *         // handle post
     *       },
     *       dom: {
     *         change: e => {
     *           // handle change event
     *         }
     *       }
     *     }
     *   })

     * @returns div element (form container element div.exf-container)
     */
    static async run(value, options) {
        options = options || {};
        options.context = options.context || await ExoFormFactory.build()
        let type = ExoFormFactory.determineSchemaType(value), x, result;

        const applyOptions = (x, dom) => {
            if (options.on) {
                for (var o in options.on) {
                    if (o === "dom" && dom) {
                        for (var p in options.on.dom) {
                            dom.addEventListener(p, options.on.dom[p])
                        }
                    }
                    else if (x) {
                        x.on(o, options.on[o])
                    }
                }
            }
        }

        switch (type) {
            case "form":
                x = options.context.createForm({
                    ...options
                });
                applyOptions(x, x.form)
                await x.load(value);
                await x.renderForm();
                return x.container;
            case "field":
                x = options.context.createForm({
                    ...options
                });
                applyOptions(x, null);
                result = await x.renderSingleControl(value);
                applyOptions(null, result);
                return result;
            case "json-schema":
                throw TypeError("Not implemented");
            default:
                throw TypeError("Not implemented");
        }
    }

    /**
     * Read JSON Schema from the given URL.
     * @param {URL} schemaUrl - The URL to read the JSON Schema from
     * @returns {Object} - JSON Schema Object
     */
    static async readJSONSchema(schemaUrl) {

        return new Promise((resolve) => {
            ExoFormFactory.run(
                {
                    model: {
                        schemas: {
                            my_custom_Instance: schemaUrl,
                        },
                        instance: {
                            my_custom_Instance: {}
                        },
                    },
                },
                {
                    on: {
                        schemaLoaded: (e) => {
                            resolve(
                                e.detail.host.schema.jsonSchemas.my_custom_Instance.schema
                            );
                        },
                    },
                }
            );
        });
    }

}

export default ExoFormFactory;