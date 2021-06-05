import ExoMultiInputControl from './ExoMultiInputControl';

class ExoCreditCardControl extends ExoMultiInputControl {

    columns = "4em 4em 4em 1fr";

    areas = `
        "name name number number"
        "expiry expiry cvv fill"`;


    fields = {
        name: { caption: "Name on Card", type: "text", maxlength: 50, required: "inherit", placeholder: "" },
        number: { caption: "Credit Card Number", type: "text", size: 16, required: "inherit", maxlength: 16, placeholder: "", pattern: "[0-9]{13,16}", },
        expiry: { caption: "Card Expires", class: "exf-label-sup", type: "month", required: "inherit", maxlength: 3, placeholder: "", min: (new Date().getFullYear() + "-" + ('0' + (new Date().getMonth() + 1)).slice(-2)) },
        cvv: { caption: "CVV", type: "number", required: "inherit", minlength: 3, maxlength: 3, size: 3, placeholder: "", min: "000" }
    }
}

export default ExoCreditCardControl;