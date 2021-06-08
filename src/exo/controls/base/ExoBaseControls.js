import ExoControlBase from './ExoControlBase';
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

class ExoBaseControls {

    static controls = {

        base: { hidden: true, type: ExoControlBase },
        element: { type: ExoElementControl, note: "Any raw HTML Element", demo: { type: "element", tagName: "div", html: `<h3>Test</h3><p>Test HTML</p>` } },
        image: {type: ExoImageControl, note: "Image element", demo: {value: "https://source.unsplash.com/random/600x400"}},
        input: { hidden: true, type: ExoInputControl },
        div: { hidden: true, type: ExoDivControl, note: "A standard HTML div container element", demo: { html: `<h3>Wow!</h3>` } },
        form: { hidden: true, type: ExoFormControl },
        formpage: { hidden: true, type: ExoFormPageControl },
        fieldset: { hidden: true, for: "page", type: ExoFieldSetControl, note: "A fieldset for grouping controls in a form" },
        text: { caption: "Short text", type: ExoTextControl, note: "Standard text input" },
        url: { caption: "Website Address/URL", base: "text", note: "A text input that will accept URLs only" },
        tel: { caption: "Phone number", base: "input", note: "A text input that is used to input phone numbers", demo: { value: "06 23467899" } },
        number: { caption: "Numeric Control", type: ExoNumberControl, note: "A text input that is used to input phone numbers", demo: { min: 1, max: 99 } },
        range: { caption: "Range Slider", type: ExoRangeControl, note: "A range slider input", demo: { min: 1, max: 10, value: 5 } },
        color: { caption: "Color Input", base: "input", note: "A control to select a color", demo: { value: "#cc4433" } },
        checkbox: { type: ExoCheckboxControl, note: "A checkbox", demo: { checked: true } },
        email: { caption: "Email Address", base: "text", note: "A text input that validates email addresses", demo: { required: true } },
        date: { base: "input", note: "A date input" },
        month: { base: "input", note: "A month selector input" },
        "datetime-local": { caption: "Local Date &amp; Time selector", base: "input", note: "A date input that is used to input local date/time" },
        search: { base: "text", note: "A search text input with a clear button" },
        password: { base: "text", note: "A text input for password masking" },
        file: { caption: "File upload", base: "text", note: "A standard file upload control" },
        multiline: { caption: "Long text", type: ExoTextAreaControl, alias: "textarea", note: "A multi-line text input" },
        list: { hidden: true, type: ExoListControl },
        dropdown: { type: ExoDropdownListControl, alias: "select", note: "A dropdown list control", demo: { items: ["First", "Second"] } },
        checkboxlist: { caption: "Multiselect List (checkbox)", type: ExoCheckboxListControl, note: "A group of checkboxes to select multiple items", demo: { items: ["First", "Second"] } },
        radiobuttonlist: { caption: "Single select List (radio)", type: ExoRadioButtonListControl, note: "A group of radio buttons to select a single value from", demo: { items: ["First", "Second"] } },
        hidden: { base: "input", note: "A hidden input that is used to store variables" },
        custom: { hidden: true, base: "div", note: "A custom control that is used to render your own ExoFormControl classes" },
        button: { type: ExoButtonControl, note: "A button control", demo: { caption: "Click me" } },
        time: { caption: "Time selector", base: "text", note: "A time input control" },
        progressbar: { type: ExoProgressControl, alias: "progress", note: "A progress indicator control" },
        link: { type: ExoLinkControl, note: "HTML Anchor element" }
    }
}

export default ExoBaseControls;