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
                containerClass: string;
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
                id: string;
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
    field: any;
    previewDiv: ChildNode;
    _change(): void;
    bind(cb: any): void;
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
    grid: string;
    _qs: (name: any) => Element;
    inputs: {};
    fields: any;
    _gc: (e: any) => {};
    _sc: (data: any) => void;
}
declare class ExoCreditCardControl extends MultiInputControl {
}
declare class ExoNameControl extends MultiInputControl {
}
declare class ExoNLAddressControl extends MultiInputControl {
    static APIUrl: string;
    "grid-template": string;
}
declare class ExoDateRangeControl extends MultiInputControl {
}
declare const ExoEmbedControl_base: typeof import("./ExoBaseControls").ExoElementControl;
declare class ExoEmbedControl extends ExoEmbedControl_base {
    width: number;
    height: number;
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
    id: string;
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
    hide(button: any): void;
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
