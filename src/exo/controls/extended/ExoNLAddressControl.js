import DOM from '../../../pwa/DOM';
import ExoMultiInputControl from './ExoMultiInputControl';


class ExoNLAddressControl extends ExoMultiInputControl {

    columns = "4em 4em 10em 1fr"

    areas = `
        "code code nr fill"
        "ext ext city city"
        "street street street street"`;


    // https://github.com/PDOK/locatieserver/wiki/API-Locatieserver
    static APIUrl = "https://geodata.nationaalgeoregister.nl/locatieserver/v3/free?q=postcode:{{code}}&huisnummer:{{nr}}";

    get fields(){
        return  {
            code: { caption: "Postcode", type: "text", size: 7, maxlength: 7, required: "inherit", pattern: "[1-9][0-9]{3}\s?[a-zA-Z]{2}", placeholder: "1234AB" },
            nr: { caption: "Huisnummer", type: "number", size: 6, maxlength: 6, required: "inherit", placeholder: "67" },
            ext: { caption: "Toevoeging", type: "text", size: 3, maxlength: 3, placeholder: "F" },
            city: { caption: "Plaats", type: "text", maxlength: 50, readonly: true, placeholder: "Den Helder" },
            street: { caption: "Straatnaam", type: "text", maxlength: 50, readonly: true, placeholder: "Dorpstraat" }
        }
    }

    set fields(value){
        // NA
    }
    
    async render() {
        const me = this;

        let element = await super.render();

        const check = () => {
            var data = this.value;

            if (data.code && data.nr) {
                fetch(DOM.format(ExoNLAddressControl.APIUrl, {
                    nr: data.nr,
                    code: data.code
                }), {
                    referer: "https://stasfpwawesteu.z6.web.core.windows.net/",
                    method: "GET"

                }).then(x => x.json()).then(j => {
                    var r = j.response;
                    if (r.numFound > 0) {
                        let d = r.docs[0];
                        me.controls["street"].value = d.straatnaam_verkort;
                        //me._qs("street").classList.add("exf-filled");
                        me.controls["city"].value = d.woonplaatsnaam;
                        //me._qs("city").classList.add("exf-filled");
                    }
                });
            }
        }


        me.controls["nr"].htmlElement.addEventListener("change", check)
        me.controls["code"].htmlElement.addEventListener("change", check)
        me.controls["ext"].htmlElement.addEventListener("change", check)

        return element;
    }

}

export default ExoNLAddressControl;