
import ExoMultiInputControl from './ExoMultiInputControl';

class ExoNameControl extends ExoMultiInputControl {

    columns = "14rem 1fr";

    areas = `"first last"`;

    get fields() {
        return {
            first: { caption: "First", type: "text", maxlength: 30, required: "inherit" },
            last: { caption: "Last", type: "text", maxlength: 50, required: "inherit" }
        }
    }

    set fields(value){
        // NA
    }


}

export default ExoNameControl;