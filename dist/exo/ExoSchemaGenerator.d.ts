export default ExoSchemaGenerator;
declare class ExoSchemaGenerator {
    typeMap: {
        string: string;
        number: string;
        boolean: string;
        null: string;
    };
    defaultSchema: {
        pages: {
            label: string;
            intro: string;
            fields: any[];
        }[];
    };
    generateFormSchema(DTO: any): {
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
    getDefault(meta: any): false | 0 | "";
}
