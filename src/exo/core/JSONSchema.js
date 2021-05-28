import ExoFormSchema from './ExoFormSchema';

class JSONSchema {
    constructor(instanceName, schema) {
        this.instanceName = instanceName;
        this.schema = schema
    }

    toString() {
        return this.instanceName + " JSON Schema";
    }

    apply(field) {

        let path = ExoFormSchema.getPathFromBind(field.bind);

        let props = this.schema.properties[path] // todo deep path

        if (!field.name) {
            field.name = path;
        }

        if (Array.isArray(this.schema.required) && this.schema.required.includes(path)) {
            field.required = true
        }

        if (!field.type) {
            if (props.type) {
                field.type = this.mapFieldType(props)
            }
        }

        if (!field.caption) {
            if (props.label) {
                field.caption = props.label;
            }
        }

    }

    mapFieldType(prop) {
        switch (prop.type) {
            case "string": return "text";
            case "number": return "number";
            case "integer": return "number";
            case "multiples": return "number";
            case "boolean": return "checkbox";
        }
    }

    
}

export default JSONSchema;