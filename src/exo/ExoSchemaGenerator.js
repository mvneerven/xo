import Core from '../pwa/Core';

class ExoSchemaGenerator {

    typeMap = {
        string: "text",
        number: "number",
        boolean: "switch",
        "null": "text"
    }

    defaultSchema = {
        "form": {
            "theme": "fluent",
            "class": "standard"
        },
        "pages": [
            {
                "label": "",
                "intro": "",
                "fields": []
            }
        ]
    }


    generateFormSchema(DTO) {

        if (!DTO)
            throw "Missing DTO";

        if (typeof (DTO) === "string")
            DTO = JSON.parse(DTO)

        this.dto = DTO;

        let schema = {
            ...this.defaultSchema
        }

        for (var p in this.dto) {
            schema.pages[0].fields.push({
                name: p,
                caption: p,
                value: this.dto[p],
                ...this.getMatchingFieldSettingsFuzzy(p, this.dto[p])
            })
        }

        return schema
    }

    getMatchingFieldSettingsFuzzy(name, value, metaData) {

        if (value === undefined) {
            value = this.getDefault(metaData)
        }

        let tp = this.typeMap[typeof (value)];

        return {
            type: tp || "text",
            caption: Core.toWords(name)
        }
    }

    getDefault(meta) {
        if (meta){
            if (meta.type === "boolean")
                return false;

            else if (meta.type === "number")
                return 0;
        }
        return "";
    }

    
}

export default ExoSchemaGenerator;