export default ExoSchemaGenerator;
declare class ExoSchemaGenerator {
    typeMap: {
        string: string;
        number: string;
        boolean: string;
        null: string;
    };
    defaultSchema: {
        form: {
            theme: string;
            class: string;
        };
        pages: {
            label: string;
            intro: string;
            fields: any[];
        }[];
    };
    generateFormSchema(DTO: any): {
        form: {
            theme: string;
            class: string;
        };
        pages: {
            label: string;
            intro: string;
            fields: any[];
        }[];
    };
    dto: any;
    getMatchingFieldSettingsFuzzy(name: any, value: any, metaData: any): {
        type: any;
        caption: any;
    };
    getDefault(meta: any): false | "" | 0;
    toWords(text: any): any;
}
