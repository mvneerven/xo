import ExoForm from './ExoForm';
import ExoFormSchema from './ExoFormSchema';
import ExoFormFactory from './ExoFormFactory';

/**
 * Hosts an ExoForm context to create forms with.
 * Created using {ExoFormFactory}.build()
 * 
 * @hideconstructor
 */
 class ExoFormContext {
    constructor(config) {
        this.config = config;
        this.baseUrl = document.location.origin;
        this.library = this._enrichMeta(config.library)
    }

    _enrichMeta(library) {
        const form = this.createForm({ // needed for meta buildup
            internal: true
        });

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

export default ExoFormContext;