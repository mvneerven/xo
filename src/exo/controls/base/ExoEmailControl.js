import ExoTextControl from './ExoTextControl';

class ExoEmailControl extends ExoTextControl {

    constructor() {
        super(...arguments);

        this.acceptProperties({
            name: "autolookup", type: Boolean, description: ""
        })

    }

    async render() {
        await super.render();


        if (this.autolookup) {
            this.createEmailLookup()
        }

        return this.container;
    }

    createEmailLookup() {
        this.htmlElement.addEventListener("input", e => {
            let data = [];

            ["@gmail.com", "@outlook.com", "@live.nl", "@yahoo.com", "@hotmail.com"].forEach(a => {
                data.push(e.target.value.split('@')[0] + a);
            });

            if (data.length > 1) {
                this.createDataList(data);
            }
            else {
                this.destroyDataList()
            }
            
        })
    }
}

export default ExoEmailControl;