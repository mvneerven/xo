export class ExoElementControl extends ExoControlBase {
}
export class ExoInputControl extends ExoElementControl {
    static returnValueType: StringConstructor;
    createEmailLookup(): void;
    destroyDataList(): void;
    testDataList(): void;
    getFetchLookup(f: any): any;
    createDataList(f: any, data: any): void;
}
export class ExoTextControl extends ExoInputControl {
    isTextInput: boolean;
}
export class ExoDivControl extends ExoElementControl {
    html: string;
}
export class ExoListControl extends ExoElementControl {
    isMultiSelect: boolean;
    view: string;
    populateList(containerElm: any, tpl: any): Promise<void>;
    addListItem(f: any, i: any, tpl: any, container: any, index: any): void;
    renderFieldSync(item: any, tpl: any, container: any): Promise<void>;
}
export class ExoNumberControl extends ExoInputControl {
    static returnValueType: NumberConstructor;
    buttons: boolean;
    minusButton: HTMLButtonElement;
    plusButton: HTMLButtonElement;
}
export class ExoRangeControl extends ExoNumberControl {
    showoutput: boolean;
    output: HTMLOutputElement;
    _sync(): void;
}
export default ExoBaseControls;
declare class ExoControlBase {
    static returnValueType: any;
    constructor(context: any);
    attributes: {};
    _visible: boolean;
    _disabled: boolean;
    _rendered: boolean;
    acceptedProperties: any[];
    dataProps: {};
    context: any;
    set htmlElement(arg: any);
    get htmlElement(): any;
    _getContainerTemplate(obj: any): any;
    _htmlElement: any;
    allowedAttributes: string[];
    isSelfClosing: boolean;
    appendChild(elm: any): void;
    typeConvert(value: any): any;
    set value(arg: any);
    get value(): any;
    triggerChange(detail: any): void;
    set visible(arg: boolean);
    get visible(): boolean;
    set disabled(arg: boolean);
    get disabled(): boolean;
    get rendered(): boolean;
    acceptProperties(...ar: any[]): void;
    _scope(): any;
    _addContainerClasses(): void;
    _getContainerClasses(): string[];
    _getBaseType(): "text" | "default" | "bool" | "multi";
    render(): Promise<any>;
    container: any;
    addEventListeners(): void;
    _getContainerAttributes(): any;
    setProperties(): void;
    _processProp(name: any, value: any): any;
    get valid(): boolean;
    get validationMessage(): string;
    showValidationError(): any;
    /**
     * Displays a help text to the user. Pass with empty @msg to hide.
     * @param {String} msg - The message to display
     * @param {Object} options - The options (type: "info|error|invalid")
     * @returns
     */
    showHelp(msg: string, options: any): void;
    _error: ChildNode;
}
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
            type: typeof ExoCheckboxControl;
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
declare class ExoFormControl extends ExoElementControl {
}
declare class ExoFormPageControl extends ExoDivControl {
    _relevant: boolean;
    _previouslyRelevant: boolean;
    set relevant(arg: boolean);
    get relevant(): boolean;
    _setRelevantState(): void;
    finalize(): void;
}
declare class ExoFieldSetControl extends ExoFormPageControl {
    _index: any;
    set index(arg: any);
    get index(): any;
}
declare class ExoCheckboxControl extends ExoCheckboxListControl {
    static returnValueType: BooleanConstructor;
    text: string;
}
declare class ExoTextAreaControl extends ExoTextControl {
    autogrow: boolean;
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
    getValidationMessage(): string;
}
