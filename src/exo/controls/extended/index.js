

import ExoFileDropControl from './ExoFileDropControl';
import ExoCKRichEditor from './ExoCKRichEditor';
import ExoSwitchControl from './ExoSwitchControl';
import ExoTaggingControl from './ExoTaggingControl';
import ExoCaptchaControl from './ExoCaptchaControl';
import ExoDropDownButton from './ExoDropDownButton';
import ExoEmbedControl from './ExoEmbedControl';
import ExoVideoControl from './ExoVideoControl';
import ExoMultiInputControl from './ExoMultiInputControl';
import ExoNameControl from './ExoNameControl';
import ExoNLAddressControl from './ExoNLAddressControl';
import ExoDateRangeControl from './ExoDateRangeControl';
import ExoDialogControl from './ExoDialogControl';
import ExoInfoControl from './ExoInfoControl';
import ExoStarRatingControl from './ExoStarRatingControl';
import ExoCreditCardControl from './ExoCreditCardControl';
import ExoLeafletMapControl from './ExoLeafletMapControl';
import ExoListViewControl from './ExoListViewControl';
import ExoTreeViewControl from './ExoTreeViewControl';
import ExoFileDialogControl from './ExoFileDialogControl';
import listviewDemo from '../../../../data/listview-demo.json';
import treeviewDemo from '../../../../data/treeview-demo.json';
import multiInputDemo from '../../../../data/multiinput-demo.json'
import ExoSandboxControl from './ExoSandboxControl';
import ExoTextConfirm from './ExoTextConfirm';
import ExoImageSelector from './ExoImageSelector';


class ExoExtendedControls {
    static controls = {
        filedrop: {
            type: ExoFileDropControl, alias: "file", note: "An input for file uploading - supports drag and drop and previewing", demo: {
                max: 1, "fileTypes": ["image/"],
                maxSize: 4096000,
                caption: "Select your profile image",
                class: "image-upload"
            }
        },
        switch: { type: ExoSwitchControl, bote: "Checkbox replacement for boolean values " },
        richtext: { type: ExoCKRichEditor, note: "A CKEditor wysiwyg/html editor wrapper for XO form" },
        tags: { caption: "Tags control", type: ExoTaggingControl, note: "A control for adding multiple tags", demo: { value: ["JavaScript", "CSS", "HTML"] } },
        multiinput: { type: ExoMultiInputControl, note: "Input container for collecting multiple values and display in a grid", demo: multiInputDemo },
        creditcard: { caption: "Credit Card", type: ExoCreditCardControl, note: "A credit card control" },
        name: { caption: "Name (first, last) group", type: ExoNameControl, note: "Person name control" },
        nladdress: { caption: "Dutch address", type: ExoNLAddressControl, note: "Nederlands adres" },
        daterange: { caption: "Date range", type: ExoDateRangeControl, note: "A date range control" },
        embed: { type: ExoEmbedControl, note: "Embed anything in an IFrame", demo: { url: "https://codepen.io/chriscoyier/embed/gfdDu" } },
        video: { type: ExoVideoControl, note: "An embedded video from YouTube or Vimeo", demo: { player: "youtube", code: "<your code here>" } },
        dropdownbutton: { hidden: true, type: ExoDropDownButton, note: "A dropdown menu button" },
        captcha: { caption: "A wrapper around the Google ReCaptcha Control, both visible and hidden", type: ExoCaptchaControl, note: "Captcha field", demo: { sitekey: "<your key here>" } },
        starrating: { type: ExoStarRatingControl, note: "An accessible star rating control", demo: { value: 2.5 } },
        dialog: { type: ExoDialogControl, caption: "Dialog", note: "A simple dialog (modal or modeless)", demo: {demo: true} },
        filedialog: { type: ExoFileDialogControl, caption: "File Dialog", note: "A simple file dialog", demo: {demo: true} },
        info: { type: ExoInfoControl, note: "An info panel", demo: { title: "Info", icon: "ti-info", body: "Your informational text" } },
        sandbox: {type: ExoSandboxControl, note: "Embed an XO form form in an isolated way (IFRAME)"},
        map: {type: ExoLeafletMapControl, note: "Leaflet interactive map" },
        listview: {type: ExoListViewControl, note: "Listview control", demo: listviewDemo},
        treeview: {type: ExoTreeViewControl, note: "Treeview control", demo: treeviewDemo},
        textconfirm: {type: ExoTextConfirm, note: "Textbox with confirmation button"},
        imageselector: {type: ExoImageSelector, note: "Image selector control"}
        
    }
}

export default ExoExtendedControls;