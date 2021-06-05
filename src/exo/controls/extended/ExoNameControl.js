
import ExoMultiInputControl from './ExoMultiInputControl';

class ExoNameControl extends ExoMultiInputControl {

    columns = "10em 1fr";

    areas = `"first last"`;

    fields = {
        first: { caption: "First", type: "text", maxlength: 30, required: "inherit" },
        last: { caption: "Last", type: "text", maxlength: 50, required: "inherit" }
    }

}

export default ExoNameControl;