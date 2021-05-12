export default ExoExtendedControls;
declare class ExoExtendedControls {
    static controls: {
        filedrop: {
            type: typeof ExoFileDropControl;
            alias: string;
            note: string;
            demo: {
                max: number;
                fileTypes: string[];
                maxSize: number;
                caption: string;
                class: string;
            };
        };
        switch: {
            type: typeof ExoSwitchControl;
        };
        richtext: {
            type: typeof ExoCKRichEditor;
            note: string;
        };
        tags: {
            caption: string;
            type: typeof ExoTaggingControl;
            note: string;
            demo: {
                tags: string[];
            };
        };
        multiinput: {
            type: typeof MultiInputControl;
        };
        creditcard: {
            caption: string;
            type: typeof ExoCreditCardControl;
            note: string;
        };
        name: {
            caption: string;
            type: typeof ExoNameControl;
            note: string;
        };
        nladdress: {
            caption: string;
            type: typeof ExoNLAddressControl;
            note: string;
        };
        daterange: {
            caption: string;
            type: typeof ExoDateRangeControl;
            note: string;
        };
        embed: {
            type: typeof ExoEmbedControl;
            note: string;
            demo: {
                url: string;
            };
        };
        video: {
            type: typeof ExoVideoControl;
            caption: string;
            note: string;
            demo: {
                player: string;
                code: string;
            };
        };
        dropdownbutton: {
            hidden: boolean;
            type: typeof DropDownButton;
            note: string;
        };
        captcha: {
            caption: string;
            type: typeof ExoCaptchaControl;
            note: string;
            demo: {
                sitekey: string;
            };
        };
        starrating: {
            type: typeof ExoStarRatingControl;
            note: string;
            demo: {
                value: number;
            };
        };
        dialog: {
            type: typeof ExoDialogControl;
            caption: string;
            note: string;
        };
        info: {
            type: typeof ExoInfoControl;
            note: string;
            demo: {
                title: string;
                icon: string;
                body: string;
            };
        };
    };
}
declare const ExoFileDropControl_base: typeof import("./ExoBaseControls").ExoInputControl;
declare class ExoFileDropControl extends ExoFileDropControl_base {
    height: number;
    field: any;
    previewDiv: ChildNode;
    _change(): void;
    bindEvents(cb: any): void;
    getDataUrl(b64: any, fileType: any): string;
}
declare const ExoSwitchControl_base: typeof import("./ExoBaseControls").ExoRangeControl;
declare class ExoSwitchControl extends ExoSwitchControl_base {
    static returnValueType: BooleanConstructor;
}
declare const ExoCKRichEditor_base: typeof import("./ExoBaseControls").ExoDivControl;
declare class ExoCKRichEditor extends ExoCKRichEditor_base {
}
declare const ExoTaggingControl_base: typeof import("./ExoBaseControls").ExoTextControl;
declare class ExoTaggingControl extends ExoTaggingControl_base {
    max: any;
    duplicate: boolean;
    wrapperClass: string;
    tagClass: string;
    arr: any[];
    wrapper: HTMLDivElement;
    input: HTMLInputElement;
    addTag(string: any): ExoTaggingControl;
    deleteTag(tag: any, i: any): ExoTaggingControl;
    anyErrors(string: any): boolean;
    addData(array: any): ExoTaggingControl;
}
declare const MultiInputControl_base: typeof import("./ExoBaseControls").ExoDivControl;
declare class MultiInputControl extends MultiInputControl_base {
    static returnValueType: ObjectConstructor;
    columns: string;
    areas: string;
    gap: string;
    inputs: {};
    fields: any;
    _qs(name: any): "" | Element;
    getFormElement(elm: any): any;
}
declare class ExoCreditCardControl extends MultiInputControl {
}
declare class ExoNameControl extends MultiInputControl {
}
declare class ExoNLAddressControl extends MultiInputControl {
    static APIUrl: string;
}
declare class ExoDateRangeControl extends MultiInputControl {
    grid: string;
}
declare const ExoEmbedControl_base: typeof import("./ExoBaseControls").ExoElementControl;
declare class ExoEmbedControl extends ExoEmbedControl_base {
    _width: string;
    _height: string;
    set width(arg: string);
    get width(): string;
    set height(arg: string);
    get height(): string;
}
declare class ExoVideoControl extends ExoEmbedControl {
    static players: {
        youtube: {
            url: string;
        };
        vimeo: {
            url: string;
        };
    };
    mute: boolean;
    autoplay: boolean;
    player: string;
    code: string;
    url: any;
}
declare const DropDownButton_base: typeof import("./ExoBaseControls").ExoListControl;
declare class DropDownButton extends DropDownButton_base {
    navTemplate: string;
    setupButton(): void;
}
declare const ExoCaptchaControl_base: typeof import("./ExoBaseControls").ExoDivControl;
declare class ExoCaptchaControl extends ExoCaptchaControl_base {
    set sitekey(arg: any);
    get sitekey(): any;
    _sitekey: any;
    set invisible(arg: boolean);
    get invisible(): boolean;
    _invisible: any;
}
declare const ExoStarRatingControl_base: typeof import("./ExoBaseControls").ExoRangeControl;
declare class ExoStarRatingControl extends ExoStarRatingControl_base {
    svg: string;
}
declare const ExoDialogControl_base: typeof import("./ExoBaseControls").ExoDivControl;
declare class ExoDialogControl extends ExoDialogControl_base {
    title: string;
    confirmText: string;
    cancelText: string;
    cancelVisible: boolean;
    body: string;
    modal: boolean;
    dlgTemplate: string;
    dlgId: string;
    hide(button: any, e: any): void;
    show(): void;
    remove(): void;
}
declare const ExoInfoControl_base: typeof import("./ExoBaseControls").ExoDivControl;
declare class ExoInfoControl extends ExoInfoControl_base {
    template: string;
    title: string;
    body: string;
    icon: string;
}
