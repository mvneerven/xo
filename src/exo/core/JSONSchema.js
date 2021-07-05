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
            let els = JSONSchema.mapType(field, props)
            for (var p in els) {

                field[p] = els[p];
            }
        }

        if (!field.caption) {
            field.caption = props.title || path;
        }

        if (props && props.description) {
            field.info = props.description;
        }


        if(props.enum){
            field.type = "dropdown";
            field.items = props.enum
        }

    }

    static mapType(field, prop) {
        // string, number, integer, object, array, boolean, null
        switch (prop.type) {

            case "string": return JSONSchema.applyStringType(field, prop);
            case "number": return JSONSchema.applyNumericType(field,prop);
            case "integer": return JSONSchema.applyIntegerRestrictions(field, JSONSchema.applyNumericType(field, prop));
            case "boolean": return { type: "checkbox" };
            case "array": return { type: "checkboxlist" };
            case "object": 
                return JSONSchema.applyObjectType(field, prop);

        }

        

        return { type: "text" }
    }

    static applyObjectType(field, props){
        let obj = { type: "multiinput" };
        
        if(!field.fields){
            obj.fields = {};
            
            for(var name in props.properties){
                var p = props.properties[name];
                obj.fields[name] = JSONSchema.mapType(obj, p)
            }
        }
        return obj;
    }

    static applyStringType(field, props) {
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

    static applyNumericType(field, props) {
        let obj = { type: "number", step: "0.01" }

        if (props.minimum !== undefined) {
            obj.min = props.minimum
        }

        if (props.maximum !== undefined) {
            obj.max = props.maximum;
        }

        if (props.exclusiveMinimum !== undefined) {
            obj.min = props.minimum;
        }

        if(props.multipleOf !== undefined) {
            obj.step = props.multipleOf;
        }

        return obj;
    }

    static applyIntegerRestrictions(field, props) {

        props.step = 1;


        return props;
    }

}

export default JSONSchema;