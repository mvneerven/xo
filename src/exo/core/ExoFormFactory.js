
import ExoBaseControls from '../controls/base';
import ExoExtendedControls from '../controls/extended';
import ExoDevControls from '../controls/dev';
import ExoChartControls from '../controls/ExoChartControls';
import ExoFormThemes from '../themes/ExoFormThemes';
import ExoFormValidation from '../validation/ExoFormValidation';
import ExoFormNavigation from '../navigation/ExoFormNavigation';
import ExoFormProgress from '../progress/ExoFormProgress';
import ExoFormRules from '../rules/ExoFormRules'
import ExoFormContext from './ExoFormContext';
import ExoLiveEditor from '../design/ExoLiveEditor';
import Core from '../../pwa/Core';
import ExoFormSchema from './ExoFormSchema';
import ExoDropdownExtension from '../controls/base/ExoDropdownExtension';


/**
 * Factory class for XO form - Used to create an XO form context.
 * Provides factory methods. Starting point for using XO form. 
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
        ruleContextReady: "ruleContextReady",
        renderReady: "renderReady", // when form rendering is complete
        interactive: "interactive", // when form is actually shown to user
        reportValidity: "reportValidity", // when form control validity is reported
        dataModelChange: "dataModelChange", // when the underlying datamodel to which the form is bound changes
        beforePage: "beforePage", // cancellable - called just before paging
        page: "page", // after moving to other page
        pageRelevancyChange: "pageRelevancyChange", // when a page's relevancy state changes (e.g. moves in/out of scope)
        beforePost: "beforePost", // called just before post - allows you to cancel the post
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

    static Schema = ExoFormSchema;

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
                console.debug("XO Controls", lib);

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

    /**
     * Generates an XO form schema with all available controls
     * @returns {Object} - XO form schema
     */
    static async all() {

        const schema = {
            submit: false,
            model: {
                instance: {
                    data: {}
                }
            },
            pages: [
                {
                    legend: "All XO form controls",
                    intro: "Below is a list of all available XO form controls",
                    fields: []
                }
            ]
        }

        const context = await xo.form.factory.build();

        Object.keys(context.library).forEach(p => {
            let props = context.library[p];
            if (!props.hidden) {

                if (props.demoSchema && Object.keys(props.demoSchema).length) {
                    props.demo = {
                        ...props.demo || {},
                        ...props.demoSchema
                    }
                }

                schema.pages[0].fields.push({
                    type: "separator"

                })

                let name = (p + "1").replace('-', '');
                schema.pages[0].fields.push({
                    type: p,
                    name: name,
                    //bind: `instance.data.${name}`,
                    caption: Core.toWords(p),
                    ...props.demo || {}
                })
            }
        });

        return schema;

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
     * Loads and parses an XO form schema from the given source
     * @param {*} value - Object, string, URL
     * @param {*} options - options
     * @returns {ExoFormSchema}
     */
    static async read(value, options) {
        options = {
            ...options || {},
            returnSchema: true
        }
        return await ExoFormFactory.run(value, options)
    }

    /**
     * Determines the XO form schema type from an object.
     * @param {Object} value 
     * @returns {String} - the detected type ("field", "json-schema" or "form")
     */
    static determineSchemaType(value) {
        if (typeof (value) === "object") {
            if (value.$schema) {
                return "json-schema";
            }

            if (value.type && (value.name || !(value.pages))) {
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
            error: null
        };
        if (result.guessedType === "javascript") {
            try {
                result.type = "javascript";
                const f = new Function("function s(){" + scriptLiteral + "; return schema};return s()");
                result.parsed = true;
                result.schema = f.call();
                result.executed = true;

            }



            catch (ex) {
                let type = ex.__proto__?.name || "TypeError", msg = ex.toString().replace(type + ": ", "");

                switch (type) {
                    case "SyntaxError":
                        result.syntaxError = ex.message;
                        result.error = new SyntaxError("Error parsing JS Literal")
                        return result;

                    case "ReferenceError":
                        break;
                }
                //console.error("XO JS Literal Parser error:", ex, scriptLiteral)

                result.error = ex;//msg
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
            }
            catch (ex) {
                console.error("Error converting '" + value + "' to " + fieldMeta.returnValueType, ex);
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
            let cnt = e.closest(".exf-ctl-cnt:not(.exf-page)");
            if (cnt) {
                let el = cnt.querySelector("[data-exf]");
                if (el && el.data)
                    field = el.data["field"];
            }
        }

        return field;
    }

    static async createDropDown(control) {
        const dex = new ExoDropdownExtension(control);
        await dex.init();
        return dex;
    }

    static fieldToString(f) {
        if (f) {
            let type = f.type || "unknown type";
            if (f.isPage)
                return `Page ${f.index} (${type})`;
            else if (f.bind)
                return `Field '${f.bind}' (${type})`;
            else if (f.name || (f.id && f.elm))
                return `Field '${f.name || f.id}' (${type})`;

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
                try {
                    x = options.context.createForm({
                        ...options
                    });
                    applyOptions(x, x.form)
                    await x.load(value);
                    if (options.returnSchema) {
                        return x.schema;
                    }
                    await x.renderForm();
                    return x.container;
                }
                catch (ex) {
                    x.events.trigger(xo.form.factory.events.error, {
                        error: ex.message
                    })
                }
                break;

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

    static err(error, exo) {
        let type = error?.__proto__?.name || "TypeError";
        return `${error} (${exo?.state || "loading"})`;
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