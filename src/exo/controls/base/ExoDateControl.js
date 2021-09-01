import ExoInputControl from './ExoInputControl';

class ExoDateControl extends ExoInputControl {

    set value(data) {
        if (typeof (data) === "string") {
            const parts = data.split("T");
            if (parts[0]) {
                data = parts[0];
            }
        }
        super.value = data;
    }

    get value() {
        return super.value;
    }
}

export default ExoDateControl;