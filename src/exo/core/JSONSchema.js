import ExoFormSchema from './ExoFormSchema';

/* 
 * see https://json-schema.org/understanding-json-schema/reference/type.html 
 * BASED ON JSON Schema version 7 
 *
 * Basic schema types: 
 *     string, number, integer, object, array, boolean, null
 */

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
            let els = this.mapJsonSchemaType(field, props)
            for (var p in els) {

                field[p] = els[p];
            }
        }

        if (!field.caption) {
            field.caption = props.title || path;
        }

        if (props.description) {
            field.info = props.description;
        }

    }

    mapJsonSchemaType(field, prop) {
        // string, number, integer, object, array, boolean, null
        switch (prop.type) {

            case "string": return this.applyStringType(field, prop);
            case "number": return this.applyNumericType(field,prop);
            case "integer": return this.applyIntegerRestrictions(field, this.applyNumericType(field, prop));
            case "boolean": return { type: "checkbox" };
            case "array": return { type: "checkboxlist" };
            case "object": 
                return this.applyObjectType(field, prop);

            //default: throw "Not implemented";


        }

        return { type: "text" }
    }

    applyObjectType(field, props){
        let obj = { type: "multiinput" };
        
        if(!field.fields){
            obj.fields = {};
            
            for(var name in props.properties){
                var p = props.properties[name];
                obj.fields[name] = this.mapJsonSchemaType(obj, p)
            }
        }
        return obj;
    }

    applyStringType(field, props) {
        let obj = { type: "text" };

        switch (props.format) {
            case "date-time":
                return { type: "datetime-local" }
            case "time":
                return { type: "text" }
            case "date":
                return { type: "date" }
            case "email":
                return { type: "email" }
            case "uri":
                return { type: "url" }
        }

        if (props.maxLength > 100) {
            obj.type = "multiline";
        }

        if (props.pattern) {
            obj.pattern = props.pattern
        }

        return obj;
    }

    applyNumericType(field, props) {
        let obj = { type: "number" }

        if (props.minimum !== undefined) {
            obj.min = props.minimum
        }

        if (props.maximum !== undefined) {
            obj.max = props.maximum;
        }

        if (props.exclusiveMinimum !== undefined) {
            obj.min = props.minimum;
        }

        return obj;
    }

    applyIntegerRestrictions(field, props) {

        props.step = 1;


        return props;
    }

}

export default JSONSchema;