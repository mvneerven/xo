

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

class ExoExtendedControls {
    static controls = {
        filedrop: {
            type: ExoFileDropControl, alias: "file", note: "An input for file uploading", demo: {
                max: 1, "fileTypes": ["image/"],
                maxSize: 4096000,
                caption: "Select your profile image",
                class: "image-upload"
            }
        },
        switch: { type: ExoSwitchControl },
        richtext: { type: ExoCKRichEditor, note: "A CKEditor wrapper for ExoForm" },
        tags: { caption: "Tags control", type: ExoTaggingControl, note: "A control for adding multiple tags", demo: { tags: ["JavaScript", "CSS", "HTML"] } },
        multiinput: { type: ExoMultiInputControl },
        creditcard: { caption: "Credit Card", type: ExoCreditCardControl, note: "A credit card control" },
        name: { caption: "Name (first, last) group", type: ExoNameControl, note: "Person name control" },
        nladdress: { caption: "Dutch address", type: ExoNLAddressControl, note: "Nederlands adres" },
        daterange: { caption: "Date range", type: ExoDateRangeControl, note: "A date range control" },
        embed: { type: ExoEmbedControl, note: "Embed anything in an IFrame", demo: { url: "https://codepen.io/chriscoyier/embed/gfdDu" } },
        video: { type: ExoVideoControl, caption: "Embed video", note: "An embedded video from YouTube or Vimeo", demo: { player: "youtube", code: "85Nyi4Xb9PY" } },
        dropdownbutton: { hidden: true, type: ExoDropDownButton, note: "A dropdown menu button" },
        captcha: { caption: "Google ReCaptcha Control", type: ExoCaptchaControl, note: "Captcha field", demo: { sitekey: "6Lel4Z4UAAAAAOa8LO1Q9mqKRUiMYl_00o5mXJrR" } },
        starrating: { type: ExoStarRatingControl, note: "An accessible star rating control", demo: { value: 2.5 } },
        dialog: { type: ExoDialogControl, caption: "Dialog", note: "A simple dialog (modal or modeless)" },
        info: { type: ExoInfoControl, note: "An info panel", demo: { title: "Info", icon: "ti-info", body: "Your informational text" } },
       
        map: {type: ExoLeafletMapControl, note: "Leaflet interactive map" },
        listview: {type: ExoListViewControl, note: "Listview control"},
        treeview: {type: ExoTreeViewControl, note: "Treeview control"}
    }
}

export default ExoExtendedControls;