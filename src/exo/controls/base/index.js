import ExoControlBase from '../ExoControlBase';
import ExoElementControl from './ExoElementControl';
import ExoInputControl from './ExoInputControl';
import ExoDivControl from './ExoDivControl';
import ExoFormControl from './ExoFormControl';
import ExoFormPageControl from './ExoFormPageControl';
import ExoFieldSetControl from './ExoFieldSetControl';
import ExoTextControl from './ExoTextControl';
import ExoNumberControl from './ExoNumberControl';
import ExoRangeControl from './ExoRangeControl';
import ExoCheckboxControl from './ExoCheckboxControl';
import ExoTextAreaControl from './ExoTextAreaControl';
import ExoListControl from './ExoListControl';
import ExoDropdownListControl from './ExoDropdownListControl';
import ExoCheckboxListControl from './ExoCheckboxListControl';
import ExoRadioButtonListControl from './ExoRadioButtonListControl';
import ExoButtonControl from './ExoButtonControl';
import ExoProgressControl from './ExoProgressControl';
import ExoLinkControl from './ExoLinkControl';
import ExoImageControl from './ExoImageControl';
import ExoUrlControl from './ExoUrlControl';
import ExoEmailControl from './ExoEmailControl';
import ExoSeparatorControl from './ExoSeparatorControl';
import ExoFileUploadControl from './ExoFileUploadControl';
import ExoDateControl from './ExoDateControl';
import ExoGroupControl from './ExoGroupControl';
import ExoRootControl from '../ExoRootControl';
import ExoPasswordControl from './ExoPasswordControl';

class ExoBaseControls { 

    static controls = {

        base: { hidden: true, type: ExoControlBase },
        element: { type: ExoElementControl, note: "Any raw HTML Element, using the tagName and html properties", demo: { type: "element", tagName: "div", html: 
            /*html*/`<div><h3>Element</h3><p>Lorem ipsum, dolor sit amet...</p></div>`, useContainer: false } },
        image: {type: ExoImageControl, note: "Image element wrapper. Use value for source (src)", demo: {value: "https://source.unsplash.com/random/600x400", class: "exf-img-sm"}},
        input: { hidden: true, type: ExoInputControl },
        div: { hidden: true, type: ExoDivControl, note: "A standard HTML div container element", demo: { html: `<h3>Title</h3><p>Body text</p>` } },
        form: { hidden: true, type: ExoFormControl },
        formpage: { hidden: true, type: ExoFormPageControl },
        fieldset: { hidden: true, for: "page", type: ExoFieldSetControl, note: "A fieldset for grouping controls in a form" },
        text: { type: ExoTextControl, note: "Standard text input control. Wraps around an input[type=text]" },
        url: { type: ExoUrlControl, note: "A text input that will accept URLs only" },
        tel: { base: "text", note: "A text input that is used to input phone numbers", demo: { value: "06 23467899" } },
        week: { base: "text", note: "A text input that is used to input week numbers", demo: { value: "2021-W27" } },
        number: { type: ExoNumberControl, note: "A text input that is used to input numeric values", demo: { min: 1, max: 99 } },
        range: { type: ExoRangeControl, note: "A range slider input control wrapper", demo: { min: 1, max: 10, value: 5 } },
        color: { base: "input", note: "A control to select a color", demo: { value: "#cc4433" } },
        checkbox: { type: ExoCheckboxControl, note: "A checkbox wrapper. Returns a boolean", demo: { value: true } },
        email: { type: ExoEmailControl, note: "A text input that validates email addresses", demo: { required: true, autolookup: true } },
        date: { type: ExoDateControl, note: "A date input wrapper" },
        month: { base: "text", note: "A month selector input wrapper" },
        "datetime-local": { base: "text", note: "A date input that is used to input local date/time" },
        search: { base: "text", note: "A search text input with a clear button" },
        password: { type: ExoPasswordControl, note: "A text input for password masking" },
        file: { type: ExoFileUploadControl, note: "A standard file upload control wrapper (input[type=file])" },
        multiline: { type: ExoTextAreaControl, alias: "textarea", note: "A multi-line text input (textarea) wrapper" },
        list: { hidden: true, type: ExoListControl },
        dropdown: { type: ExoDropdownListControl, alias: "select", note: "A dropdown list control (select-one) wrapper", demo: { items: ["First", "Second"] } },
        checkboxlist: { type: ExoCheckboxListControl, note: "A group of checkboxes to select multiple items", demo: { items: ["First", "Second"] } },
        radiobuttonlist: {  type: ExoRadioButtonListControl, note: "A group of radio buttons to select a single value from", demo: { items: ["First", "Second"] } },
        hidden: { base: "input", note: "A hidden input that is used to store variables" },
        custom: { hidden: true, base: "div", note: "A custom control that is used to render your own ExoFormControl classes" },
        button: { type: ExoButtonControl, note: "A button control", demo: { caption: "Click me" } },
        time: { base: "text", note: "A time input control (input[type=time]) wrapper" },
        progressbar: { type: ExoProgressControl, alias: "progress", note: "A progress indicator control (progress) wrapper", demo: {value: "72", max: "100"}},
        link: { type: ExoLinkControl, note: "HTML Anchor element", demo: {url: "http://blacknegative.com/", html: "Visit http://blacknegative.com/", external: true} },
        separator: {type: ExoSeparatorControl, note: "Separator" },
        group: {type: ExoGroupControl, note: "Group control" },
        formcontainer: {type: ExoRootControl, hidden: true}
    }
}

export default ExoBaseControls;