export default ExoBaseControls;
declare class ExoBaseControls {
    static controls: {
        base: {
            hidden: boolean;
            type: typeof ExoControlBase;
        };
        element: {
            type: typeof ExoElementControl;
            note: string;
            demo: {
                type: string;
                tagName: string;
                src: string;
            };
        };
        input: {
            hidden: boolean;
            type: typeof ExoInputControl;
        };
        div: {
            hidden: boolean;
            type: typeof ExoDivControl;
            note: string;
            demo: {
                html: string;
            };
        };
        form: {
            hidden: boolean;
            type: typeof ExoFormControl;
        };
        formpage: {
            hidden: boolean;
            type: typeof ExoFormPageControl;
        };
        fieldset: {
            hidden: boolean;
            for: string;
            type: typeof ExoFieldSetControl;
            note: string;
        };
        text: {
            caption: string;
            type: typeof ExoTextControl;
            note: string;
        };
        url: {
            caption: string;
            base: string;
            note: string;
        };
        tel: {
            caption: string;
            base: string;
            note: string;
            demo: {
                value: string;
            };
        };
        number: {
            caption: string;
            type: typeof ExoNumberControl;
            note: string;
            demo: {
                min: number;
                max: number;
            };
        };
        range: {
            caption: string;
            type: typeof ExoRangeControl;
            note: string;
            demo: {
                min: number;
                max: number;
                value: number;
            };
        };
        color: {
            caption: string;
            base: string;
            note: string;
            demo: {
                value: string;
            };
        };
        checkbox: {
            base: string;
            note: string;
            demo: {
                checked: boolean;
            };
        };
        email: {
            caption: string;
            base: string;
            note: string;
            demo: {
                required: boolean;
            };
        };
        date: {
            base: string;
            note: string;
        };
        month: {
            base: string;
            note: string;
        };
        "datetime-local": {
            caption: string;
            base: string;
            note: string;
        };
        search: {
            base: string;
            note: string;
        };
        password: {
            base: string;
            note: string;
        };
        file: {
            caption: string;
            base: string;
            note: string;
        };
        multiline: {
            caption: string;
            type: typeof ExoTextAreaControl;
            alias: string;
            note: string;
        };
        list: {
            hidden: boolean;
            type: typeof ExoListControl;
        };
        dropdown: {
            type: typeof ExoDropdownListControl;
            alias: string;
            note: string;
            demo: {
                items: string[];
            };
        };
        checkboxlist: {
            caption: string;
            type: typeof ExoCheckboxListControl;
            note: string;
            demo: {
                items: string[];
            };
        };
        radiobuttonlist: {
            caption: string;
            type: typeof ExoRadioButtonListControl;
            note: string;
            demo: {
                items: string[];
            };
        };
        hidden: {
            base: string;
            note: string;
        };
        custom: {
            hidden: boolean;
            base: string;
            note: string;
        };
        button: {
            type: typeof ExoButtonControl;
            note: string;
            demo: {
                caption: string;
            };
        };
        time: {
            caption: string;
            base: string;
            note: string;
        };
        progressbar: {
            type: typeof ExoProgressControl;
            alias: string;
            note: string;
        };
        link: {
            type: typeof ExoLinkControl;
            note: string;
        };
    };
}
declare class ExoControlBase {
    static returnValueType: any;
    constructor(context: any);
    attributes: {};
    acceptedProperties: any[];
    dataProps: {};
    containerTemplate: string;
    context: any;
    set htmlElement(arg: any);
    get htmlElement(): any;
    _htmlElement: any;
    allowedAttributes: string[];
    isSelfClosing: boolean;
    appendChild(elm: any): void;
    triggerChange(detail: any): void;
    set enabled(arg: boolean);
    get enabled(): boolean;
    acceptProperties(...ar: any[]): void;
    render(): Promise<any>;
    container: any;
    addEventListeners(): void;
    getContainerAttributes(): {
        caption: any;
        tooltip: any;
        class: any;
        id: string;
    };
    setProperties(): void;
}
declare class ExoElementControl extends ExoControlBase {
}
declare class ExoInputControl extends ExoElementControl {
    static returnValueType: StringConstructor;
    createEmailLookup(): void;
    testDataList(): void;
    getFetchLookup(f: any): any;
    createDataList(f: any, data: any): void;
}
declare class ExoDivControl extends ExoElementControl {
    html: string;
}
declare class ExoFormControl extends ExoElementControl {
}
declare class ExoFormPageControl extends ExoDivControl {
    finalize(): void;
}
declare class ExoFieldSetControl extends ExoFormPageControl {
}
declare class ExoTextControl extends ExoInputControl {
    isTextInput: boolean;
}
declare class ExoNumberControl extends ExoInputControl {
    static returnValueType: NumberConstructor;
}
declare class ExoRangeControl extends ExoNumberControl {
}
declare class ExoTextAreaControl extends ExoTextControl {
}
declare class ExoListControl extends ExoElementControl {
    isMultiSelect: boolean;
    view: string;
    populateList(containerElm: any, tpl: any): Promise<void>;
    addListItem(f: any, i: any, tpl: any, container: any): void;
    renderFieldSync(item: any, tpl: any, container: any): Promise<void>;
}
declare class ExoDropdownListControl extends ExoListControl {
}
declare class ExoCheckboxListControl extends ExoInputListControl {
    static returnValueType: ArrayConstructor;
    optionType: string;
}
declare class ExoRadioButtonListControl extends ExoInputListControl {
    optionType: string;
}
declare class ExoButtonControl extends ExoElementControl {
    iconHtml: string;
    set icon(arg: any);
    get icon(): any;
    _icon: any;
}
declare class ExoProgressControl extends ExoElementControl {
}
declare class ExoLinkControl extends ExoElementControl {
}
declare class ExoInputListControl extends ExoListControl {
}
